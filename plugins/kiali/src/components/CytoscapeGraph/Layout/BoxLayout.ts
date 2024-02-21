/*
  BoxLayout

  This is a synthetic layout that helps to better layout the contents of box (i.e. compound)
  nodes, in this way we ensure that the box nodes themselves are as small as possible, and avoiding
  overlaps with other nodes.

  It finishes by executing the default (i.e. user-selected) layout but prior to that will
  individually layout the box node contents using the requested layouts.

  Is composed of:
   - The [optional] configured box layouts will layout the children of the box node.
     - appBoxLayout, clusterBoxLayout, namespaceBoxLayout
   - The [required] configured defaultLayout is used for any box layouts not otherwise specified, and is
     applied for the final layout.
   - A Synthetic edge generator creates synthetic edges (more info below).

  The algorithm is roughly as follow:

  1. For every box type (working inner to outer)
       2. For every box node:
          a. The box layout is run for every box and its relative positions (to the parent)
             are saved for later use.
          b. Get the resulting bounding box of the compound node, set the width and height of the node
             using `cy.style`, so that the real layout honors the size when doing the layout.
          c. For every edge that goes to a child (or comes from a child), create a synthetic edge
            that goes to (or comes from) the compound node and remove the original
            edge. We can cull away repeated edges as they are not needed.
          d. Remove the children. This is important, else cytoscape won't honor the size specified
             in previous step. "A compound parent node does not have independent dimensions (position
             and size), as those values are automatically inferred by the positions and dimensions
             of the descendant nodes." http://js.cytoscape.org/#notation/compound-nodes
  3. Run the default layout on this new graph and wait until it finishes.
     a. Restore the children.
     b. Remove the synthetic edges.
     c. For every child set the relative position to its parent
 */

import { BoxByType, NodeAttr } from '../../../types/Graph';
import { getLayoutByName } from '../graphs/LayoutDictionary';

export const BOX_NODE_CLASS = '__boxNodeClass';

const NAMESPACE_KEY = 'box-layout';
const STYLES_KEY = NAMESPACE_KEY + 'styles';
const RELATIVE_POSITION_KEY = NAMESPACE_KEY + 'relative_position';
const PARENT_POSITION_KEY = NAMESPACE_KEY + '.parent_position';

// Styles used to have more control on how the compound nodes are going to be seen by the Layout algorithm.
type OverridenStyles = {
  shape: string;
  width: string;
  height: string;
};

type LayoutBoxTypeResult = {
  boxNodes: any;
  syntheticEdges: any;
  removedElements: any;
};

/**
 * Synthetic edge generator replaces edges to and from boxed nodes with edges to/from their boxes. Care is
 * taken to not generate duplicate edges when sourceA has multiple real edges into the same box.
 */
class SyntheticEdgeGenerator {
  private nextId = 0;
  private generatedMap = {};

  public getEdge(parentBoxType: BoxByType, source: any, target: any) {
    const sourceId = this.normalizeToParent(parentBoxType, source).id();
    const targetId = this.normalizeToParent(parentBoxType, target).id();

    if (sourceId === targetId) {
      return false;
    }

    const key = `${sourceId}->${targetId}`;

    if (this.generatedMap[key]) {
      return false;
    }

    this.generatedMap[key] = true;

    return {
      group: 'edges',
      data: {
        id: 'synthetic-edge-' + this.nextId++,
        source: sourceId,
        target: targetId
      }
    };
  }

  // Returns the element's parent if it exists and is also of the correct boxType.
  private normalizeToParent(parentBoxType: BoxByType, element: any) {
    const parent = element.parent();
    return parent && parent.data(NodeAttr.isBox) === parentBoxType ? parent : element;
  }
}


const getBoxNodes = function(elements: any, boxByType: BoxByType): any {
  return elements.nodes(`[${NodeAttr.isBox}="${boxByType}"]`);
}

const runLayout =  async(_layoutName, layout): Promise<any> => {
  // Avoid propagating any local layout events up to cy, this would yield a global operation before the nodes are ready.
  layout.on('layoutstart layoutready layoutstop', _event => {
    return false;
  });

  // We know ALL algorithms (breadthfirst, dagre, grid, contentric) are discrete, we can resolve when run() returns
  return layout.run();
}


const layoutBoxType = async (boxByType: BoxByType, cy: cytoscape.Core, syntheticEdgeGenerator: SyntheticEdgeGenerator, elements:any, appBoxLayout: string, clusterBoxLayout: string, namespaceBoxLayout: string, defaultLayout: string): Promise<LayoutBoxTypeResult> => {
  return new Promise((resolve, _reject) => {
    const boxNodes = getBoxNodes(elements, boxByType);

    let boxLayoutOptions;
    switch (boxByType) {
      case BoxByType.APP:
        boxLayoutOptions = getLayoutByName(appBoxLayout);
        break;
      case BoxByType.CLUSTER:
        boxLayoutOptions = getLayoutByName(clusterBoxLayout);
        break;
      case BoxByType.NAMESPACE:
        boxLayoutOptions = getLayoutByName(namespaceBoxLayout);
        break;
      default:
        boxLayoutOptions = getLayoutByName(defaultLayout);
    }

    // Before completing work for the box type we must wait for all individual box work to complete
    const boxNodePromises: Promise<any>[] = [];

    // (2) Prepare each box node by assigning a size and running the compound layout
    boxNodes.each(boxNode => {
      const boxedNodes = boxNode.children();
      const boxedElements = boxedNodes.add(boxedNodes.edgesTo(boxedNodes));
      const boxLayout = boxedElements.layout(boxLayoutOptions);

      boxNodePromises.push(
        new Promise((resolve, _reject) => {
          // (2.a) This promise resolves when the layout actually stops.
          runLayout(boxLayoutOptions.name, boxLayout).then(_response => {
            // (2.b) get the bounding box
            // see https://github.com/cytoscape/cytoscape.js/issues/2402
            const boundingBox = boxNode.boundingBox();

            // Save the relative positions, as we will need them later.
            boxedNodes.each(boxedNode => {
              boxedNode.scratch(RELATIVE_POSITION_KEY, boxedNode.relativePosition());
            });

            const backupStyles: OverridenStyles = {
              shape: boxNode.style('shape'),
              height: boxNode.style('height'),
              width: boxNode.style('width')
            };

            const newStyles: OverridenStyles = {
              shape: 'rectangle',
              height: `${boundingBox.h}px`,
              width: `${boundingBox.w}px`
            };

            // Saves a backup of current styles to restore them after we finish
            boxNode.scratch(STYLES_KEY, backupStyles);
            boxNode.addClass(BOX_NODE_CLASS);

            boxNode.style(newStyles);

            resolve(true);
          });
        })
      );
    });

    Promise.all(boxNodePromises).then(_results => {
      let removedElements = cy.collection();
      let syntheticEdges = cy.collection();

      // (2.c) Add synthetic edges for every edge that touches a child node.
      const boxedNodes = boxNodes.children();
      for (const boxedNode of boxedNodes) {
        for (const edge of boxedNode.connectedEdges()) {
          const syntheticEdge = syntheticEdgeGenerator.getEdge(boxByType, edge.source(), edge.target());
          if (syntheticEdge) {
            syntheticEdges = syntheticEdges.add(cy.add(syntheticEdge));
          }
        }
      }
      // (2.d) Remove all child nodes from parents (and their edges).
      removedElements = removedElements.add(cy.remove(boxedNodes));

      resolve({ boxNodes: boxNodes, syntheticEdges: syntheticEdges, removedElements: removedElements });
    });
  });
}

/**
 * @brief       : constructor
 * @arg options : object containing layout options
 */
export function BoxLayout( options:any ){
  this.appBoxLayout = options.appBoxLayout || options.defaultLayout;
  this.clusterBoxLayout = options.clusterBoxLayout || options.defaultLayout;
  this.defaultLayout = options.defaultLayout;
  this.namespaceBoxLayout = options.namespaceBoxLayout || options.defaultLayout;
  this.cy = options.cy;
  this.elements = options.eles;
  this.syntheticEdgeGenerator = new SyntheticEdgeGenerator();
}


BoxLayout.prototype.run = function() {
  let allBoxNodes = this.cy.collection();
  let removedElements = this.cy.collection();
  let syntheticEdges = this.cy.collection();

  // (1) working from inner boxing to outer boxing, perform the box layouts. the inner box layouts
  // must complete before the outer box layouts can proceed.
  async() => {
    const AppLayout = layoutBoxType(BoxByType.APP, this.cy, this.syntheticEdgeGenerator, this.elements, this.appBoxLayout, this.clusterBoxLayout, this.namespaceBoxLayout, this.defaultLayout);
    const NsLayout = layoutBoxType(BoxByType.NAMESPACE, this.cy, this.syntheticEdgeGenerator, this.elements, this.appBoxLayout, this.clusterBoxLayout, this.namespaceBoxLayout, this.defaultLayout);
    const ClusterLayout = layoutBoxType(BoxByType.CLUSTER, this.cy, this.syntheticEdgeGenerator, this.elements, this.appBoxLayout, this.clusterBoxLayout, this.namespaceBoxLayout, this.defaultLayout);
        
    await Promise.all([AppLayout, NsLayout, ClusterLayout]).then( results => {
      results.forEach( result => {
        allBoxNodes = allBoxNodes.add(result.boxNodes);
        removedElements = removedElements.add(result.removedElements);
        syntheticEdges = syntheticEdges.add(result.syntheticEdges);
      })
    })
  }
 
  // (3) perform the final layout...

  // Before running the layout, reset the elements positions.
  // This is not absolutely necessary, but without this we have seen some problems with
  //  `cola` + firefox + a particular mesh
  // Ensure we only touch the requested elements and not the whole graph.
  const layoutElements = this.cy.collection().add(this.elements).subtract(removedElements).add(syntheticEdges);
  layoutElements.position({ x: 0, y: 0 });

  const layout = this.cy.layout({
    // Create a new layout
    ...getLayoutByName(this.defaultLayout), // Sharing the main options
    eles: this.cy.elements() // and the current elements
  });

  // Add a one-time callback to be fired when the layout stops
  layout.one('layoutstop', _event => {
    // If we add any children back, our parent nodes position are going to take the bounding box's position of all
    // their children. Before doing it, save this position in order to add this up to their children.
    allBoxNodes.each(boxNode => {
      boxNode.scratch(PARENT_POSITION_KEY, { ...boxNode.position() }); // Make a copy of the position, its an internal data from cy.
    });

    // (3.a) Add back the child nodes (with edges still attached)
    removedElements.restore();

    // (3.b) Remove synthetic edges
    this.cy.remove(syntheticEdges);

    // (3.c) Add and position the children nodes according to the layout
    allBoxNodes.each(boxNode => {
      const parentPosition = boxNode.scratch(PARENT_POSITION_KEY);
      boxNode.children().each(child => {
        const relativePosition = child.scratch(RELATIVE_POSITION_KEY);
        child.position({
          x: parentPosition.x + relativePosition.x,
          y: parentPosition.y + relativePosition.y
        });
        child.removeData(RELATIVE_POSITION_KEY);
      });

      boxNode.style(boxNode.scratch(STYLES_KEY));
      boxNode.removeClass(BOX_NODE_CLASS);

      // Discard the saved values
      boxNode.removeScratch(STYLES_KEY);
      boxNode.removeScratch(PARENT_POSITION_KEY);
    });

    this.emit('layoutstop');
  });

  // Avoid propagating any local layout events up to cy, this would yield a global operation before the nodes are ready.
  layout.on('layoutstart layoutready layoutstop', _event => {
    return false;
  });

  layout.run();
}


 /**
   * This is a stub required by cytoscape to allow the layout impl to emit events
   * @param _events space separated string of event names
   */
 BoxLayout.prototype.emit = function(_events) {
  // intentionally empty
}
