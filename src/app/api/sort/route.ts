import { NextResponse } from 'next/server';

export type Action = 
  | { type: "COMPARE"; indices: number[] }
  | { type: "SWAP"; indices: number[] }
  | { type: "OVERWRITE"; index: number; value: number }
  | { type: "MARK_SORTED"; indices: number[] };

function bubbleSortSteps(arr: number[]): Action[] {
    const steps: Action[] = [];
    const n = arr.length;
    const array = [...arr];
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            steps.push({ type: "COMPARE", indices: [j, j + 1] });
            if (array[j] > array[j + 1]) {
                steps.push({ type: "SWAP", indices: [j, j + 1] });
                const temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }
        }
        steps.push({ type: "MARK_SORTED", indices: [n - i - 1] });
    }
    steps.push({ type: "MARK_SORTED", indices: [0] });
    return steps;
}

function selectionSortSteps(arr: number[]): Action[] {
    const steps: Action[] = [];
    const n = arr.length;
    const array = [...arr];
    for (let i = 0; i < n; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            steps.push({ type: "COMPARE", indices: [minIdx, j] });
            if (array[j] < array[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            steps.push({ type: "SWAP", indices: [i, minIdx] });
            const temp = array[i];
            array[i] = array[minIdx];
            array[minIdx] = temp;
        }
        steps.push({ type: "MARK_SORTED", indices: [i] });
    }
    return steps;
}

function insertionSortSteps(arr: number[]): Action[] {
    const steps: Action[] = [];
    const n = arr.length;
    const array = [...arr];
    steps.push({ type: "MARK_SORTED", indices: [0] });
    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;
        
        while (j >= 0 && array[j] > key) {
            steps.push({ type: "COMPARE", indices: [j, j + 1] });
            steps.push({ type: "OVERWRITE", index: j + 1, value: array[j] });
            array[j + 1] = array[j];
            j = j - 1;
        }
        steps.push({ type: "OVERWRITE", index: j + 1, value: key });
        array[j + 1] = key;
        
        const sortedSoFar = [];
        for(let k = 0; k <= i; k++) sortedSoFar.push(k);
        steps.push({ type: "MARK_SORTED", indices: sortedSoFar });
    }
    return steps;
}

function quickSortSteps(arr: number[]): Action[] {
    const steps: Action[] = [];
    const array = [...arr];
    
    function partition(low: number, high: number): number {
        const pivot = array[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
            steps.push({ type: "COMPARE", indices: [j, high] });
            if (array[j] < pivot) {
                i++;
                steps.push({ type: "SWAP", indices: [i, j] });
                const temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
        steps.push({ type: "SWAP", indices: [i + 1, high] });
        const temp = array[i + 1];
        array[i + 1] = array[high];
        array[high] = temp;
        return i + 1;
    }
    
    function qSort(low: number, high: number) {
        if (low < high) {
            const pi = partition(low, high);
            steps.push({ type: "MARK_SORTED", indices: [pi] });
            qSort(low, pi - 1);
            qSort(pi + 1, high);
        } else if (low === high) {
            steps.push({ type: "MARK_SORTED", indices: [low] });
        }
    }
    
    qSort(0, array.length - 1);
    return steps;
}

function mergeSortSteps(arr: number[]): Action[] {
    const steps: Action[] = [];
    const array = [...arr];

    function merge(l: number, m: number, r: number) {
        const n1 = m - l + 1;
        const n2 = r - m;
        const L = new Array(n1);
        const R = new Array(n2);
        for (let i = 0; i < n1; i++) L[i] = array[l + i];
        for (let j = 0; j < n2; j++) R[j] = array[m + 1 + j];

        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            steps.push({ type: "COMPARE", indices: [l + i, m + 1 + j] });
            if (L[i] <= R[j]) {
                steps.push({ type: "OVERWRITE", index: k, value: L[i] });
                array[k] = L[i];
                i++;
            } else {
                steps.push({ type: "OVERWRITE", index: k, value: R[j] });
                array[k] = R[j];
                j++;
            }
            k++;
        }

        while (i < n1) {
            steps.push({ type: "OVERWRITE", index: k, value: L[i] });
            array[k] = L[i];
            i++;
            k++;
        }
        while (j < n2) {
            steps.push({ type: "OVERWRITE", index: k, value: R[j] });
            array[k] = R[j];
            j++;
            k++;
        }
    }

    function mSort(l: number, r: number) {
        if (l >= r) return;
        const m = l + Math.floor((r - l) / 2);
        mSort(l, m);
        mSort(m + 1, r);
        merge(l, m, r);
    }

    mSort(0, array.length - 1);
    const allIndices = [];
    for(let i=0; i<array.length; i++) allIndices.push(i);
    steps.push({ type: "MARK_SORTED", indices: allIndices });
    
    return steps;
}

function heapSortSteps(arr: number[]): Action[] {
    const steps: Action[] = [];
    const array = [...arr];
    const n = array.length;

    function heapify(n: number, i: number) {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

        if (l < n) {
            steps.push({ type: "COMPARE", indices: [l, largest] });
            if (array[l] > array[largest]) largest = l;
        }
        if (r < n) {
            steps.push({ type: "COMPARE", indices: [r, largest] });
            if (array[r] > array[largest]) largest = r;
        }

        if (largest !== i) {
            steps.push({ type: "SWAP", indices: [i, largest] });
            const temp = array[i];
            array[i] = array[largest];
            array[largest] = temp;
            heapify(n, largest);
        }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
    }

    for (let i = n - 1; i > 0; i--) {
        steps.push({ type: "SWAP", indices: [0, i] });
        const temp = array[0];
        array[0] = array[i];
        array[i] = temp;
        steps.push({ type: "MARK_SORTED", indices: [i] });
        heapify(i, 0);
    }
    steps.push({ type: "MARK_SORTED", indices: [0] });
    return steps;
}

function shellSortSteps(arr: number[]): Action[] {
    const steps: Action[] = [];
    const array = [...arr];
    const n = array.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i += 1) {
            const temp = array[i];
            let j;
            for (j = i; j >= gap; j -= gap) {
                steps.push({ type: "COMPARE", indices: [j - gap, i] }); // Loose representation
                if (array[j - gap] > temp) {
                    steps.push({ type: "OVERWRITE", index: j, value: array[j - gap] });
                    array[j] = array[j - gap];
                } else {
                    break;
                }
            }
            steps.push({ type: "OVERWRITE", index: j, value: temp });
            array[j] = temp;
        }
    }
    const allIndices = [];
    for(let i=0; i<array.length; i++) allIndices.push(i);
    steps.push({ type: "MARK_SORTED", indices: allIndices });
    return steps;
}


export async function POST(req: Request) {
    try {
        const { array, algorithm } = await req.json();
        let steps: Action[] = [];
        
        switch (algorithm) {
            case 'bubble': steps = bubbleSortSteps(array); break;
            case 'selection': steps = selectionSortSteps(array); break;
            case 'insertion': steps = insertionSortSteps(array); break;
            case 'quick': steps = quickSortSteps(array); break;
            case 'merge': steps = mergeSortSteps(array); break;
            case 'heap': steps = heapSortSteps(array); break;
            case 'shell': steps = shellSortSteps(array); break;
            default: steps = bubbleSortSteps(array); break;
        }
        
        return NextResponse.json({ steps });
    } catch (e) {
        return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
}
