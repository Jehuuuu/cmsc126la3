/**
 * PriorityQueue.js
 * Efficient priority queue implementation using a binary heap
 * Optimized for pathfinding algorithms with O(log n) operations
 */

//=============================================================================
// PRIORITY QUEUE
//=============================================================================

class PriorityQueue {
    //=============================================================================
    // INITIALIZATION
    //=============================================================================
    
    /**
     * Create a new priority queue
     * @param {Function} comparator - Custom comparator function (defaults to min-heap by distance)
     */
    constructor(comparator = (a, b) => a.distance - b.distance) {
        this.heap = [];
        this.comparator = comparator;
        this.nodePositions = new Map(); // Maps node position strings to indices in the heap
    }

    //=============================================================================
    // QUEUE OPERATIONS
    //=============================================================================

    /**
     * Add an element to the queue with O(log n) time complexity
     * @param {any} element - Element to add (typically a Node object)
     */
    enqueue(element) {
        // Get position key for Node objects
        const posKey = element.getPositionString ? element.getPositionString() : null;
        
        // If this node is already in the queue, remove it first
        if (posKey && this.nodePositions.has(posKey)) {
            this.remove(posKey);
        }
        
        // Add to heap
        this.heap.push(element);
        const index = this.heap.length - 1;
        
        // Store position in map if it's a Node
        if (posKey) {
            this.nodePositions.set(posKey, index);
        }
        
        // Bubble up to maintain heap property
        this.bubbleUp(index);
    }

    /**
     * Remove and return the highest priority element with O(log n) time complexity
     * @returns {any} The highest priority element or null if queue is empty
     */
    dequeue() {
        if (this.isEmpty()) return null;
        
        const min = this.heap[0];
        const last = this.heap.pop();
        
        // Remove from position map if it's a Node
        if (min.getPositionString) {
            this.nodePositions.delete(min.getPositionString());
        }
        
        if (this.heap.length > 0) {
            this.heap[0] = last;
            
            // Update position in map if it's a Node
            if (last.getPositionString) {
                this.nodePositions.set(last.getPositionString(), 0);
            }
            
            // Bubble down to maintain heap property
            this.bubbleDown(0);
        }
        
        return min;
    }

    /**
     * Remove an element by its position key with O(log n) time complexity
     * @param {string} posKey - Position key of the element to remove
     * @returns {boolean} True if element was removed, false otherwise
     */
    remove(posKey) {
        if (!this.nodePositions.has(posKey)) return false;
        
        const index = this.nodePositions.get(posKey);
        const removed = this.heap[index];
        const last = this.heap.pop();
        
        // If we removed the last element, we're done
        if (index === this.heap.length) {
            this.nodePositions.delete(posKey);
            return true;
        }
        
        // Otherwise, replace with the last element
        this.heap[index] = last;
        this.nodePositions.delete(posKey);
        
        if (last.getPositionString) {
            this.nodePositions.set(last.getPositionString(), index);
        }
        
        // Determine whether to bubble up or down to maintain heap property
        const parent = this.getParentIndex(index);
        if (parent >= 0 && this.comparator(this.heap[index], this.heap[parent]) < 0) {
            this.bubbleUp(index);
        } else {
            this.bubbleDown(index);
        }
        
        return true;
    }

    /**
     * Update a node's priority in the queue with O(log n) time complexity
     * @param {any} node - Node to update
     * @returns {boolean} True if update was successful, false otherwise
     */
    update(node) {
        if (!node.getPositionString) return false;
        
        const posKey = node.getPositionString();
        if (!this.nodePositions.has(posKey)) return false;
        
        const index = this.nodePositions.get(posKey);
        
        // Replace with new node
        this.heap[index] = node;
        
        // Determine whether to bubble up or down to maintain heap property
        const parent = this.getParentIndex(index);
        if (parent >= 0 && this.comparator(this.heap[index], this.heap[parent]) < 0) {
            this.bubbleUp(index);
        } else {
            this.bubbleDown(index);
        }
        
        return true;
    }

    /**
     * Get the highest priority element without removing it
     * @returns {any} The highest priority element or null if queue is empty
     */
    peek() {
        return this.isEmpty() ? null : this.heap[0];
    }

    /**
     * Check if the queue contains a node with the given position
     * @param {string} posKey - Position key to check
     * @returns {boolean} True if the queue contains the node
     */
    contains(posKey) {
        return this.nodePositions.has(posKey);
    }

    /**
     * Check if the queue is empty
     * @returns {boolean} True if the queue is empty
     */
    isEmpty() {
        return this.heap.length === 0;
    }

    /**
     * Get the number of elements in the queue
     * @returns {number} The number of elements
     */
    size() {
        return this.heap.length;
    }

    //=============================================================================
    // HEAP OPERATIONS
    //=============================================================================

    /**
     * Get the index of the parent of an element
     * @param {number} index - Index of the element
     * @returns {number} Index of the parent
     */
    getParentIndex(index) {
        return Math.floor((index - 1) / 2);
    }

    /**
     * Get the index of the left child of an element
     * @param {number} index - Index of the element
     * @returns {number} Index of the left child
     */
    getLeftChildIndex(index) {
        return 2 * index + 1;
    }

    /**
     * Get the index of the right child of an element
     * @param {number} index - Index of the element
     * @returns {number} Index of the right child
     */
    getRightChildIndex(index) {
        return 2 * index + 2;
    }

    /**
     * Bubble an element up to its correct position
     * @param {number} index - Index of the element
     */
    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = this.getParentIndex(index);
            
            if (this.comparator(this.heap[index], this.heap[parentIndex]) >= 0) {
                break;
            }
            
            // Swap with parent
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            
            // Update position map for both nodes
            if (this.heap[index].getPositionString) {
                this.nodePositions.set(this.heap[index].getPositionString(), index);
            }
            
            if (this.heap[parentIndex].getPositionString) {
                this.nodePositions.set(this.heap[parentIndex].getPositionString(), parentIndex);
            }
            
            index = parentIndex;
        }
    }

    /**
     * Bubble an element down to its correct position
     * @param {number} index - Index of the element
     */
    bubbleDown(index) {
        const last = this.heap.length - 1;
        
        while (true) {
            const leftChildIndex = this.getLeftChildIndex(index);
            const rightChildIndex = this.getRightChildIndex(index);
            let smallest = index;
            
            // Compare with left child
            if (leftChildIndex <= last && this.comparator(this.heap[leftChildIndex], this.heap[smallest]) < 0) {
                smallest = leftChildIndex;
            }
            
            // Compare with right child
            if (rightChildIndex <= last && this.comparator(this.heap[rightChildIndex], this.heap[smallest]) < 0) {
                smallest = rightChildIndex;
            }
            
            // If no change, we're done
            if (smallest === index) {
                break;
            }
            
            // Swap with the smaller child
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            
            // Update position map for both nodes
            if (this.heap[index].getPositionString) {
                this.nodePositions.set(this.heap[index].getPositionString(), index);
            }
            
            if (this.heap[smallest].getPositionString) {
                this.nodePositions.set(this.heap[smallest].getPositionString(), smallest);
            }
            
            index = smallest;
        }
    }
} 