// old sorting and searching snippets are archived here
// since they aren't used anymore (due to obvious inefficiency)

// selection sort
for (let i = 0; i < tree.length; i++) {
  if (i % 1000 === 0) {
    console.log(`[${new Date().toISOString()}] ${i}/${tree.length}`);
  }
  let small = i;
  for (let j = i + 1; j < tree.length; j++) {
    if (tree[j].value < tree[small].value) small = j;
  }
  if (small !== i) {
    [tree[i], tree[small]] = [tree[small], tree[i]];
  }
}

// bubble sort
let swapped,
  pass = 0;
do {
  if (pass % 1000 === 0) {
    console.log(`[${new Date().toISOString()}] ${pass}th pass`);
  }
  swapped = false;
  for (let i = 0; i < tree.length; i++) {
    if (tree[i + 1] && tree[i].value > tree[i + 1].value) {
      [tree[i], tree[i + 1]] = [tree[i + 1], tree[i]];
      swapped = true;
    }
  }
  pass++;
} while (swapped);

// linear search (~4.1s difference)
let found;
for (let j = 0; j < tree.length; j++) {
  if (tree[j].value === target) {
    found = j;
  }
  if (found) break;
}
// binary search + sort (~1.4s difference)
let left = 0,
  right = tree.length - 1,
  mid;
while (left <= right) {
  mid = Math.floor((left + right) / 2);
  if (tree[mid].value < target) left = mid + 1;
  else if (tree[mid].value > target) right = mid - 1;
  else break; // found index is contained in mid
}