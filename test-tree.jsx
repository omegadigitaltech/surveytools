import React from 'react';
import { renderToString } from 'react-dom/server';
import Tree from 'react-d3-tree';

const data = {
  name: 'Root',
  children: [
    { name: 'Child 1' }
  ]
};

try {
  const html = renderToString(<Tree data={[data]} />);
  console.log("Success with array!");
} catch(e) {
  console.error("Error with array:", e.message);
}

try {
  const html2 = renderToString(<Tree data={data} />);
  console.log("Success with object!");
} catch(e) {
  console.error("Error with object:", e.message);
}
