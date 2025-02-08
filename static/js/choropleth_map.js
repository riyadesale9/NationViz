// Set dimensions and margins
const width = 1200;
const height = 600;
const margin = { top: 50, right: 30, bottom: 50, left: 30 };

// Create an SVG element
const svg = d3.select("#choropleth-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Projection and path generator for the map
const projection = d3.geoMercator()
    .scale(130)
    .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

// Tooltip (styled based on your image)
const tooltip = d3.select("#choropleth-map").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "#333")
    .style("color", "#fff")
    .style("padding", "10px")
    .style("border-radius", "8px")
    .style("box-shadow", "0px 4px 8px rgba(0,0,0,0.2)")
    .style("font-family", "sans-serif")
    .style("text-align", "center");

// Color scale (adjusted for better contrast)
const colorScale = d3.scaleSequential(d3.interpolateReds)
    .domain([0, 1600000]); // Adjust domain based on population data

// Load GeoJSON data (world countries) and CSV data (population)
Promise.all([
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'),
   //d3.csv('static/data/population_data.csv')
]).then(function([geoData]) {

    // Filter for year 2100
    //const year2100Data = populationData.filter(d => d['Year(s)'] === '2020');

    // Create a map of country names to population values for year 2100
    const populationByCountry = {};
    populationData.forEach(d => {
        populationByCountry[d.Country] = +d.Value;
    });

    const countryNameMap = {
        "USA": "United States of America",
        "Russia": "Russian Federation",
        "India": "India",
        "Canada": "Canada",
        "China": "China",
        // Add other mappings as necessary
    };

    // Function to update the map based on the filtered data for year 2100
    svg.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", d => {
            
            const countryName = d.properties.name;
            const mappedName = countryNameMap[countryName];
            const population = populationByCountry[mappedName];
           
            if (!population) {
                console.warn(`No population data for ${mappedName}`);
            }
            // const population = populationByCountry[countryName];
            return population ? colorScale(population) : "#ccc"; // Use grey for countries without data
        })
        .on("mouseover", function(event, d) {
            const countryName = d.properties.name;
            const mappedName = countryNameMap[countryName];
            const population = populationByCountry[mappedName] || "No data";

            // Show tooltip with country name and population
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${countryName}</strong><br>Population: ${population.toLocaleString()}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px");

            // Highlight hovered segment by increasing opacity
            d3.select(this).transition().duration(200).style("stroke-width", "2px").style("stroke", "#333");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 50) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(200).style("opacity", 0);
            d3.select(this).transition().duration(200).style("stroke-width", "0px");
        });
});

// Add legend for color scale
const legendGroup = svg.append('g')
   .attr('transform', `translate(${width - margin.right - 100}, ${height / 2 - margin.top})`); 

legendGroup.append('text')
   .attr('x', -40)
   .attr('y', -20)
   .text('Population')
   .style('font-size', '14px')
   .attr('alignment-baseline', 'middle');

// Legend colors and labels
const legendColors = [100000, 500000, 1000000, 1500000];
legendColors.forEach((d, i) => {
   legendGroup.append('rect')
      .attr('x', -40)
      .attr('y', i * 20)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', colorScale(d));

   legendGroup.append('text')
      .attr('x', -15)
      .attr('y', i * 20 + 9)
      .text(d.toLocaleString())
      .style('font-size', '12px')
      .attr('alignment-baseline', 'middle');
});