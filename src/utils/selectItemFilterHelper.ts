export interface SelectItem<T> {
  value: T
  label: string
}

/**
 * Generically filters any Record dictionary by parsing its keys using a delimiter 
 * and matching a specific segment position against a target criteria string.
 * * @param record - The source dictionary object (e.g., ActivityTypeDescriptions)
 * @param targetGroup - The string group value you want to match against (e.g., 'Tale')
 * @param delimiter - The character separating the key names (Defaults to '_')
 * @param segmentIndex - Look at the first element (0) or last element (-1) after split (Defaults to -1)
 */
export function filterSelectItems<K extends string, V extends string>(
  record: Record<K, V>,
  targetGroup: string | null | undefined,
  delimiter = '_',
  segmentIndex = -1
): SelectItem<K>[] {
  if (!targetGroup || targetGroup === '-1') return []

  const targetLower = targetGroup.toLowerCase()
  const allKeys = Object.keys(record) as K[]

  return allKeys
    .filter((key) => {
      const parts = key.split(delimiter)
      
      // Calculate target array index (handles -1 safely for the last item)
      const index = segmentIndex === -1 ? parts.length - 1 : segmentIndex
      const currentSegment = parts[index]

      // Edge case: If the key didn't contain the delimiter, fallback to a prefix check
      if (parts.length === 1) {
        return key.toLowerCase().startsWith(targetLower)
      }

      return currentSegment && currentSegment.toLowerCase() === targetLower
    })
    .map((key) => ({
      value: key,
      label: record[key]
    }))
}