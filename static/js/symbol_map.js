// Set dimensions and margins
const width = 1200;
const height = 600;
const margin = { top: 50, right: 30, bottom: 50, left: 30 };

// Create an SVG element
const svg = d3.select("#symbol-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Projection and path generator for the map
const projection = d3.geoMercator()
    .scale(130)
    .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

// Tooltip (styled based on your image)
const tooltip = d3.select("#symbol-map").append("div")
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

// Load GeoJSON data (world countries) and CSV data (freight values)
Promise.all([
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'),
]).then(function([geoData]) {


    const freightByCountry = {};
    freightData.forEach(d => {
        freightByCountry[d['Country or Area']] = +d.Value;
    });


    const countryNameMap = {
        "USA": "United States",
        "Russia": "Russia",
        "India": "India",
        "Canada": "Canada",
        "China": "China",
        // Add other mappings as necessary
    };

    // Draw the world map
    svg.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "#ccc") // Grey background for countries
        .attr("stroke", "#fff");

    // Add dots on countries based on freight values
    svg.selectAll("circle")
        .data(geoData.features.filter(d => {
            const countryName = d.properties.name;

            const mappedName = countryNameMap[countryName];
        
            return freightByCountry[mappedName]
        })) // Filter countries with data
        .join("circle")
        .attr("cx", d => {
            const coordinates = projection(d3.geoCentroid(d)); // Use centroid of country from GeoJSON
            return coordinates[0];
        })
        .attr("cy", d => {
            const coordinates = projection(d3.geoCentroid(d)); // Use centroid of country from GeoJSON
            return coordinates[1];
        })
        .attr("r", d => {
            const countryName = d.properties.name;
            const mappedName = countryNameMap[countryName];
            return Math.sqrt(freightByCountry[mappedName]) / 9}
        )
        .attr("fill", "red")
        .attr("opacity", 0.7)
        .on("mouseover", function(event, d) {
            const countryName = d.properties.name;
            const mappedName = countryNameMap[countryName];
            const freightValue = freightByCountry[mappedName] || "No data";

            // Show tooltip with country name and freight value
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${countryName}</strong><br>Freight in ton-km: ${freightValue.toLocaleString()}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 50) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 50) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(200).style("opacity", 0);
        });

    const legendGroup = svg.append('g')
        .attr('transform', `translate(${width - margin.right - 100}, ${height - margin.bottom - 100})`);

    const legendValues = [1000, 10000, 25000, 40000]; // Example values for legend

    legendGroup.selectAll(".legend-circle")
        .data(legendValues)
        .enter()
        .append('circle')
        .attr('cx', 40)
        .attr('cy', (d, i) => i * 40)
        .attr('r', d => Math.sqrt(d) / 9)
        .attr('fill', 'red')
        .attr('opacity', 0.7);

    legendGroup.selectAll(".legend-label")
        .data(legendValues)
        .enter()
        .append('text')
        .attr('x', 80)
        .attr('y', (d, i) => i * 40 + 5)
        .text(d => `${d.toLocaleString()}`)
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle');
});