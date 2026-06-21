import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function DendrogramD3({ data, width = 800, height = 450 }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.name) return;

    // Deep copy data just in case
    const rawData = JSON.parse(JSON.stringify(data));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Setup base SVG and a group for zooming/panning
    svg.attr("width", width)
       .attr("height", height)
       .style("cursor", "grab");

    const g = svg.append("g");

    // Setup Zoom
    const zoom = d3.zoom()
      .scaleExtent([0.5, 15])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Initial transform: slightly shifted
    svg.call(zoom.transform, d3.zoomIdentity.translate(50, height / 2).scale(0.8));

    // Determine dark mode class on document
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? "#e5e7eb" : "#374151";
    const linkColor = isDark ? "#4b5563" : "#9ca3af";

    // Create Hierarchy
    const root = d3.hierarchy(rawData);

    const margin = { top: 20, right: 120, bottom: 20, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const cluster = d3.cluster()
      .size([innerHeight, innerWidth]);

    cluster(root);

    // Initial zoom transform: shift to respect margins, scale 1 to fit everything
    svg.call(zoom.transform, d3.zoomIdentity.translate(margin.left, margin.top).scale(1));

    // Draw Links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", linkColor)
      .attr("stroke-width", "1px")
      .attr("opacity", 0.6)
      .attr(
        "d",
        d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x)
      );

    // Draw Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr(
        "transform",
        d => `translate(${d.y},${d.x})`
      );

    // Draw Circles
    node.append("circle")
      .attr("r", 3)
      .attr("fill", d => d.children ? "#3b82f6" : "#10b981")
      .attr("stroke", isDark ? "#1f2937" : "#ffffff")
      .attr("stroke-width", "1px");

    // Draw Labels
    node.append("text")
      .attr("dx", d => d.children ? -6 : 6)
      .attr("dy", "0.31em")
      .attr("text-anchor", d => d.children ? "end" : "start")
      .style("font-size", "9px")
      .style("font-family", "sans-serif")
      .style("fill", textColor)
      .style("user-select", "none")
      // Only show text for leaves or major clusters to prevent text overlap since it's zoomed out
      .text(d => {
        if (d.children && d.depth > 2) return ""; // Hide deep inner cluster text
        const name = d.data.name;
        // Truncate long IDs (e.g. MongoDB ObjectIDs)
        if (!d.children && name && name.length > 10) {
          return "User " + name.substring(0, 5);
        }
        return name;
      });

  }, [data, width, height]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent cursor-grab active:cursor-grabbing">
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} viewBox={`0 0 ${width} ${height}`}></svg>
    </div>
  );
}
