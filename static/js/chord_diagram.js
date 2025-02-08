const width = 650;
const height = 500;
const outerRadius = Math.min(width, height) * 0.5 - 35;
const innerRadius = outerRadius - 30;

const svg = d3.select("#chord-diagram").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

const chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending);

const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

const ribbon = d3.ribbon()
    .radius(innerRadius);

const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

// Tooltip initialization
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "#333")
    .style("color", "#fff")
    .style("padding", "5px")
    .style("border-radius", "5px");

// Prepare matrix from disclosureData
function prepareMatrix(data) {
    const countries = Array.from(new Set(data.map(d => d['Country or Area'])));
    const matrix = countries.map(() => Array(countries.length).fill(0));

    data.forEach(d => {
        const i = countries.indexOf(d['Country or Area']);
        if (i >= 0) {
            data.forEach(other => {
                const j = countries.indexOf(other['Country or Area']);
                if (j >= 0 && i !== j) {
                    const diff = Math.abs(d.Value - other.Value);
                    matrix[i][j] += diff;
                }
            });
        }
    });

    return {matrix, countries};
}

const {matrix, countries} = prepareMatrix(disclosureData);

const chords = chord(matrix);

// Draw arcs
svg.append("g")
  .selectAll("path")
  .data(chords.groups)
  .enter().append("path")
    .style("fill", d => colorScale(countries[d.index]))
    .style("stroke", d => d3.rgb(colorScale(countries[d.index])).darker())
    .attr("d", arc);

// Add country names next to the arcs with improved positioning and rotation
svg.append("g")
   .selectAll("text")
   .data(chords.groups)
   .enter().append("text")
   .each(function(d) { 
       // Calculate angle for positioning and rotation
       d.angle = (d.startAngle + d.endAngle) / 2; 
   })
   .attr("dy", ".35em") // Vertical alignment adjustment
   .attr("transform", function(d) {
       // Calculate position for text based on angle and add a margin to move it outward
       const rotateAngle = (d.angle * 180 / Math.PI - 90);
       const xPos = outerRadius * Math.cos(d.angle - Math.PI / 2) * 1.1; // Adjusted margin (1.1)
       const yPos = outerRadius * Math.sin(d.angle - Math.PI / 2) * 1.1; // Adjusted margin (1.1)
       return `translate(${xPos},${yPos}) rotate(${rotateAngle})`;
   })
   .attr("text-anchor", function(d) {
       // Align text based on its position in the circle (left or right side)
       return d.angle > Math.PI ? "end" : "start";
   })
   // Ensure that text is not upside down
   .attr('transform', function(d) {
       const angleDeg = (d.angle * 180 / Math.PI - 90);
       const xPos = outerRadius * Math.cos(d.angle - Math.PI / 2) * 1.1;
       const yPos = outerRadius * Math.sin(d.angle - Math.PI / 2) * 1.1;
       return `translate(${xPos},${yPos}) rotate(${angleDeg > 90 && angleDeg < 270 ? angleDeg + 180 : angleDeg})`;
   })
   .text(d => countries[d.index])
   .style('font-size', '12px')
   .style('fill', '#000'); // Text color

// Draw ribbons (connections between arcs)
svg.append("g")
  .selectAll("path")
  .data(chords)
  .enter().append("path")
    .attr("d", ribbon)
    .style("fill", d => colorScale(countries[d.target.index]))
    .style("stroke", d => d3.rgb(colorScale(countries[d.target.index])).darker())
    .on('mouseover', function(event, d) {
        tooltip.transition().duration(100).style("opacity", 1);
        tooltip.html(`<strong>${countries[d.source.index]} & ${countries[d.target.index]}</strong><br>Value: ${d.source.value}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
      })
      .on('mouseout', function() {
        tooltip.transition().duration(100).style("opacity", 0);
      });
