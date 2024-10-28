/* SUMMARY:
This draw.io extension creates a visual representation of files from a selected
directory. When activated, it:

1. Opens your computer's folder picker dialog
2. Reads the files from your chosen directory
3. Creates a grid layout of rectangles in draw.io where each rectangle shows:
  - File name
  - File extension
  - File size
  - Last modified date
4. Arranges these rectangles automatically in a 3-column grid

It's useful for quickly visualizing the contents of a folder within your draw.io
diagrams, which can be helpful for documentation, file system planning, or
creating visual file inventories.
*/
Draw.loadPlugin(function(ui) {
  // Adds menu item
  ui.actions.addAction('createFileGrid', function() {
    createFileGrid(ui);
  });
  
  // Correctly add to menu using proper mxClient API
  ui.menubar.addMenu('File Grid', function(menu, parent) {
    ui.menus.addMenuItem(menu, 'createFileGrid');
  });

  async function createFileGrid(ui) {
    try {
      const graph = ui.editor.graph;
      graph.getModel().beginUpdate();
      
      try {
        // Open directory picker
        const dirHandle = await window.showDirectoryPicker();
        
        // Collect file information
        const files = [];
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            files.push({
              name: entry.name,
              extension: entry.name.split('.').pop(),
              size: formatFileSize(file.size),
              lastModified: new Date(file.lastModified).toLocaleDateString()
            });
          }
        }
        
        // Grid layout parameters
        const startX = 50;
        const startY = 50;
        const rectWidth = 200;
        const rectHeight = 100;
        const horizontalGap = 30;
        const verticalGap = 30;
        const columnsCount = 3;
        
        // Create rectangles for each file
        files.forEach((file, index) => {
          const col = index % columnsCount;
          const row = Math.floor(index / columnsCount);
          
          const x = startX + col * (rectWidth + horizontalGap);
          const y = startY + row * (rectHeight + verticalGap);
          
          // Create rectangle vertex
          const rect = graph.insertVertex(
            graph.getDefaultParent(),
            null,
            createLabel(file),
            x, y, rectWidth, rectHeight,
            'rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;'
          );
        });
        
        // Fit the graph view to show all rectangles
        graph.fit();
        
      } finally {
        graph.getModel().endUpdate();
      }
      
    } catch (error) {
      console.error('Error:', error);
      mxUtils.alert('Error creating file grid: ' + error.message);
    }
  }
  
  // Helper function to format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Helper function to create HTML label for rectangles
  function createLabel(file) {
    return `<div style="font-family: Arial; font-size: 12px; padding: 5px;">
      <div style="font-weight: bold; margin-bottom: 5px;">${file.name}</div>
      <div>Extension: ${file.extension}</div>
      <div>Size: ${file.size}</div>
      <div>Modified: ${file.lastModified}</div>
    </div>`;
  }
});