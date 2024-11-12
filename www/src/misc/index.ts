export function join<T>(arr: T[], separator: (index: number) => T): T[] {
  if (arr.length === 0) {
    return [];
  }

  const result: T[] = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    result.push(separator(i));
    result.push(arr[i]);
  }
  return result;
}
