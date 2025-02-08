// Set dimensions and margins
const width = 600;
const height = 550;
const radius = Math.min(width, height) / 2;
const xOffset = 20

// Create an SVG element
const svg = d3.select("#sunburst-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2 + xOffset},${height / 2})`);

// Create a partition layout for the sunburst
const partition = d3.partition()
    .size([2 * Math.PI, radius]);

// Create an arc generator for the sunburst slices
const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1);

// Color scheme based on Tableau10 color scheme
const colorScheme = {
    "United States": "#4F81BD",
    "China": "#C0504D",
    "India": "#5FBB68",
    "Russia": "#fd6f30",
    "Canada": "#8064A2"
};

// Function to generate lighter shades for second and third levels
function lightenColor(color, percent) {
    const num = parseInt(color.slice(1), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) + amt,
          G = (num >> 8 & 0x00FF) + amt,
          B = (num & 0x0000FF) + amt;
    return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
                 (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
                 (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1).toUpperCase()}`;
}

// Tooltip
const tooltip = d3.select("#sunburst-chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "#333")
    .style("color", "#fff")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("box-shadow", "0px 4px 8px rgba(0,0,0,0.2)")
    .style("font-family", "sans-serif")
    .style("text-align", "center");

// Parse expenditureDataJson passed from Streamlit
const expenditureData = JSON.parse(expenditureDataJson);

// Convert flat data into hierarchical structure for sunburst chart
function buildHierarchy(data) {
    const root = { name: "root", children: [] };
    
    data.forEach(d => {
        const countryNode = root.children.find(c => c.name === d.Country);
        if (!countryNode) {
            root.children.push({ name: d.Country, children: [{ name: d.Year, children: [{ name: d.Category, value: +d['Percent of GDP'] }] }] });
        } else {
            const yearNode = countryNode.children.find(y => y.name === d.Year);
            if (!yearNode) {
                countryNode.children.push({ name: d.Year, children: [{ name: d.Category, value: +d['Percent of GDP'] }] });
            } else {
                yearNode.children.push({ name: d.Category, value: +d['Percent of GDP'] });
            }
        }
    });

    return d3.hierarchy(root).sum(d => d.value);
}

// Build hierarchy from flat data
const root = buildHierarchy(expenditureData);

// Compute the partition layout
partition(root);

// Draw the sunburst slices with hover effects and tooltips
svg.selectAll('path')
   .data(root.descendants())
   .enter().append('path')
   .attr('d', arc)
   // Apply color scheme with lighter shades for second and third levels
   .style('fill', d => {
       if (d.depth === 1) return colorScheme[d.data.name]; // First level (Country)
       if (d.depth === 2) return lightenColor(colorScheme[d.parent.data.name], 20); // Second level (Year)
       if (d.depth === 3) return lightenColor(colorScheme[d.parent.parent.data.name], 40); // Third level (Category)
       return '#ccc';
   })
   .style('stroke', '#fff')
   .on('mouseover', function(event, d) {
       // Highlight section on hover
       d3.select(this).transition().duration(200).style('opacity', 0.7);
       tooltip.transition().duration(200).style('opacity', 1);
       tooltip.html(`Name: ${d.data.name}<br>Value: ${d.value}%`)
           .style('left', (event.pageX + 10) + 'px')
           .style('top', (event.pageY - 50) + 'px');
   })
   .on('mouseout', function() {
       // Reset opacity and hide tooltip on mouse out
       d3.select(this).transition().duration(200).style('opacity', 1);
       tooltip.transition().duration(200).style('opacity', 0);
   });

// Add white center circle to represent root node
svg.append('circle')
   .attr('r', radius / 4) // Adjust size of center circle as needed
   .attr('fill', 'white');

svg.append("text")
   .attr("text-anchor", "middle")
   .attr("dy", "0.35em")
   .style("font-size", "25px")
   .style("font-weight", "bold")
   .text("Expenditure");

// Text labels with improved readability
// svg.selectAll("text")
// .data(root.descendants())
// .enter().append("text")
// .attr("transform", function(d) {
//     const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
//     const y = (Math.sqrt(d.y0 + radius * 0.15) + Math.sqrt(d.y1)) / 2;
//     return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
// })
// .attr("dy", "0.35em")
// .style("text-anchor", "middle")
// .style("font-size", "10px")
// .text(d => d.depth === 1 ? d.data.name : d.depth === 2 ? d.data.name : "");

// Add labels to each section (optional)
svg.selectAll('text')
   .data(root.descendants())
   .enter().append('text')
   .attr('transform', function(d) { 
       const x = (d.x0 + d.x1) / 2 * (180 / Math.PI); 
       const y = (d.y0 + d.y1) / 2;
       console.log(d)
       return `translate(${arc.centroid(d)[0]},${arc.centroid(d)[1]}) rotate(${x - 90})`; 
   })
   .attr('dx', '-20') // Adjust label position as needed
   .attr('dy', '.5em')
   .text(d => d.depth === 1 ? d.data.name : d.depth === 2 ? d.data.name : d.depth === 3 ? d.data.name : "") // Only show country names at the first level
   .style('font-size', '10px')
   .style('fill', '#000');