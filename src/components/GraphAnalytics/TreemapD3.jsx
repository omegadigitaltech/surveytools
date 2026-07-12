import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function TreemapD3({ data, width = 800, height = 450 }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // We need to wrap flat data into a root node for d3.treemap
    const rootData = {
      name: "Root",
      children: data.map(d => ({ ...d }))
    };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width)
       .attr("height", height);

    // Determine dark mode class
    const isDark = document.documentElement.classList.contains('dark');
    const strokeColor = isDark ? "#1f2937" : "#ffffff";
    const textColor = "#ffffff"; // Always white for better contrast inside colored blocks

    // Create Hierarchy and calculate values
    const root = d3.hierarchy(rootData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Setup Treemap layout
    d3.treemap()
      .size([width, height])
      .padding(2)
      .round(true)(root);

    // Color scale for the categories
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw leaf nodes (the actual data points)
    const leaves = root.leaves();

    const node = svg.selectAll("g")
      .data(leaves)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Draw Rectangles
    node.append("rect")
      .attr("width", d => Math.max(0, d.x1 - d.x0))
      .attr("height", d => Math.max(0, d.y1 - d.y0))
      .attr("fill", (d, i) => color(i))
      .attr("stroke", strokeColor)
      .attr("stroke-width", "2px")
      .attr("rx", 4) // Slight rounded corners for a modern look
      .attr("ry", 4);

    // Draw Text Labels
    // Only add text if the rectangle is large enough
    node.each(function(d) {
      const group = d3.select(this);
      const rectWidth = d.x1 - d.x0;
      const rectHeight = d.y1 - d.y0;

      // Only draw text if we have reasonable space
      if (rectWidth > 50 && rectHeight > 30) {
        // Name Label
        group.append("text")
          .attr("x", 6)
          .attr("y", 18)
          .text(d.data.name)
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .attr("fill", textColor)
          .attr("font-family", "sans-serif")
          // Truncate text if it's too long for the box
          .each(function() {
            const textNode = d3.select(this).node();
            let textStr = d.data.name;
            while (textNode.getComputedTextLength() > rectWidth - 12 && textStr.length > 0) {
              textStr = textStr.slice(0, -1);
              d3.select(this).text(textStr + "...");
            }
          });

        // Value Label
        if (rectHeight > 45) {
          group.append("text")
            .attr("x", 6)
            .attr("y", 34)
            .text(`Val: ${d.data.value}`)
            .attr("font-size", "11px")
            .attr("fill", "rgba(255, 255, 255, 0.8)")
            .attr("font-family", "sans-serif");
        }
      }
    });

  }, [data, width, height]);

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} viewBox={`0 0 ${width} ${height}`}></svg>
    </div>
  );
}
