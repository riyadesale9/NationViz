const margin = {top: 20, right: 150, bottom: 50, left: 50}; // Increased right margin
const width = 600 - margin.left - margin.right; 
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#line-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right + 100) // Increased total width
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().domain([2009.5, 2020.5]).range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const xAxis = svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x).ticks(11).tickFormat(d3.format("d")));

svg.append("text")
  .attr("x", width / 2)
  .attr("y", height + margin.bottom - 15) 
  .attr("text-anchor", "middle")
  .style("font-size", "12px")
  .attr("font-weight", "bold")
  .text("Year");

const yAxis = svg.append("g");

svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -30)
    .attr('fill', 'black')
    .style('text-anchor', 'middle')
    .style('font-size','12px')
    .attr("font-weight", "bold")
    .text('Mobile subscriptions per 100 inhabitants');

const color = d3.scaleOrdinal(d3.schemeTableau10);

const tooltip = d3.select("#line-chart").append("div")
  .style("position", "absolute")
  .style("background", "#333")
  .style("color", "#fff")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("display", "none");

function update(data) {
  const nestedData = d3.group(data, d => d.Country);
  y.domain([0, d3.max(data, d => d.Subscriptions)]);
  
  yAxis.transition().duration(500).call(d3.axisLeft(y));

  const line = d3.line()
    .x(d => x(d.Year))
    .y(d => y(d.Subscriptions));

  const lines = svg.selectAll(".line")
    .data(nestedData, ([key]) => key);

  lines.enter()
    .append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .merge(lines)
    .transition()
    .duration(500)
    .attr("stroke", ([key]) => color(key))
    .attr("d", ([key, values]) => line(values));

  lines.exit().remove();

  svg.selectAll(".dot")
    .data(data)
    .join(
      enter => enter.append("circle").attr("class", "dot")
        .attr("r", 4)
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Subscriptions))
        .style("fill", d => color(d.Country))
        .on("mouseover", (event, d) => {
          tooltip.style("display", "block")
            .html(`${d.Year}<br>${d.Country}: ${d.Subscriptions}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none")),
      update => update.transition().duration(500)
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Subscriptions)),
      exit => exit.remove()
    );

const legend = svg.append("g")
    .attr("transform", `translate(${width + 40}, 0)`);

const legendItems = legend.selectAll('.legend-item')
    .data(nestedData.keys())
    .enter().append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);

legendItems.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 18)
    .attr('height', 18)
    .style("fill", color);

legendItems.append('text')
    .attr('x', 24)
    .attr('y', 14)
    .text(d => d);
}

update(mobileData);
