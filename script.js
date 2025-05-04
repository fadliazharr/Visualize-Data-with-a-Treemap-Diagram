document.addEventListener('DOMContentLoaded', function() {
    const width = 960;
    const height = 600;

    // Create SVG for treemap
    const svg = d3.select("#treemap")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create tooltip
    const tooltip = d3.select("#tooltip");

    // Load data
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json")
        .then(data => {
            const root = d3.hierarchy(data).sum(d => d.value);

            d3.treemap()
                .size([width, height])
                .padding(1)(root);

            // Color scale
            const categories = root.leaves().map(d => d.data.category);
            const uniqueCategories = [...new Set(categories)];
            const colorScale = d3.scaleOrdinal()
                .domain(uniqueCategories)
                .range(d3.schemeSet3); // ensures 12 distinct colors

            // Create tiles
            const tiles = svg.selectAll("g")
                .data(root.leaves())
                .enter()
                .append("g")
                .attr("transform", d => `translate(${d.x0},${d.y0})`);

            tiles.append("rect")
                .attr("class", "tile")
                .attr("data-name", d => d.data.name)
                .attr("data-category", d => d.data.category)
                .attr("data-value", d => d.data.value)
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", d => colorScale(d.data.category))
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);

                    tooltip.html(`
                        Name: ${d.data.name}<br>
                        Category: ${d.data.category}<br>
                        Value: $${d.data.value}M
                    `)
                        .attr("data-value", d.data.value)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            // Add text to tiles
            tiles.append("text")
                .selectAll("tspan")
                .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
                .enter()
                .append("tspan")
                .attr("x", 4)
                .attr("y", (d, i) => 15 + i * 14)
                .text(d => d)
                .style("font-size", "10px")
                .style("fill", "#333");

            // Create legend
            const legendWidth = 960;
            const legendItemSize = 20;
            const spacing = 150;
            const legendSvg = d3.select("#legend")
                .append("svg")
                .attr("width", legendWidth)
                .attr("height", 100);

            const legend = legendSvg.selectAll("g")
                .data(uniqueCategories)
                .enter()
                .append("g")
                .attr("transform", (d, i) => {
                    const x = (i % 6) * spacing;
                    const y = Math.floor(i / 6) * 30;
                    return `translate(${x}, ${y})`;
                });

            // ✅ This rect needs the class
            legend.append("rect")
                .attr("class", "legend-item")
                .attr("width", legendItemSize)
                .attr("height", legendItemSize)
                .attr("fill", d => colorScale(d));

            legend.append("text")
                .attr("x", legendItemSize + 5)
                .attr("y", legendItemSize / 2)
                .attr("dy", "0.35em")
                .text(d => d)
                .style("font-size", "12px");
        })
        .catch(error => {
            console.error("Error loading data:", error);
        });
});
