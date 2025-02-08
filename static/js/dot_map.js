// Set dimensions and margins
const width = 1200;
const height = 600;
const margin = { top: 50, right: 30, bottom: 50, left: 30 };

// Create an SVG element
const svg = d3.select("#dot-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Projection and path generator for the map
const projection = d3.geoMercator()
    .scale(130)
    .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

// Tooltip (styled based on your image)
const tooltip = d3.select("#dot-map").append("div")
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

// Load GeoJSON data (world countries) and CSV data (passenger values)
Promise.all([
    d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'),
]).then(function([geoData,]) {

    // Create a map of country names to passenger values for year 2021
    const passengersByCountry = {};
    passengerData.forEach(d => {
        passengersByCountry[d['Country or Area']] = +d.Value;
    });

    const countryNameMap = {
        "USA": "United States",
        "Russia": "Russia",
        "India": "India",
        "Canada": "Canada",
        "China": "China",
    };
    // Draw the world map
    svg.selectAll("path")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", "#e5e5b8") // Light yellow background for countries
        .attr("stroke", "#fff");
    
    

    // Add dots on countries based on passenger values (one dot per 100000 passengers)
    svg.selectAll(".country-dots")
        .data(geoData.features.filter(d => {
            const countryName = d.properties.name;
            const mappedName = countryNameMap[countryName];
            return passengersByCountry[mappedName]
        })) // Filter countries with data
        .join(function(enter) {
            const group = enter.append('g').attr('class', 'country-dots');
            return group;
        })
        .each(function(d) {
            const countryName = d.properties.name;
            const mappedName = countryNameMap[countryName];
            const passengerValue = passengersByCountry[mappedName];
            const numDots = Math.floor(passengerValue / 1000000); // Calculate number of dots (one per 100000 passengers)

            const bounds = path.bounds(d); // Get bounding box of the country
            const xMin = bounds[0][0], xMax = bounds[1][0];
            const yMin = bounds[0][1], yMax = bounds[1][1];

            // Generate dots randomly within the country's boundaries
            let dotsPlaced = 0;
            while (dotsPlaced < numDots) {
                const randomX = Math.random() * (xMax - xMin) + xMin;
                const randomY = Math.random() * (yMax - yMin) + yMin;

                // Check if the random point is inside the country's boundary
                if (d3.geoContains(d, projection.invert([randomX, randomY]))) {
                    d3.select(this).append('circle')
                        .attr('cx', randomX)
                        .attr('cy', randomY)
                        .attr('r', 2) // Small radius for each dot
                        .attr('fill', '#b30000') // Dark red color for dots
                        .attr('opacity', 0.7);
                    dotsPlaced++;
                }
            }
        })
        .on("mouseover", function(event, d) {
            const countryName = d.properties.name;
            const mappedName = countryNameMap[countryName];
            const Value = passengersByCountry[mappedName] || "No data";

            // Show tooltip with country name and freight value
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${countryName}</strong><br>Number of Passengers: ${Value.toLocaleString()}`)
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

});