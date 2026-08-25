
// -- IMPORTS --
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getValidGeneralSortType, getValidDateScope } from '@/utils/validators'; 

export const useVerificationListFilterStore = defineStore('verificationListFilter', () => {
  
// State
const startdate = ref<string | null>(null)
const enddate = ref<string | null>(null)
const scope = ref<string | null>(null)
const isabandoned = ref<string | null>(null)
const isregistered = ref<string | null>(null)
const bypasscache = ref<string | null>(null)
const keyword = ref<string | null>(null);
const sort = ref<string | null>(null)
const pointer = ref<string | number>('1');

   // --- 3. HELPER UTILITIES ---
  // Pure parsing helper: returns null if missing, empty, or placeholder
function parseValue(value: any): string | null {
  if (value === undefined || value === null || value === '') {
    return null
  }
  return String(value).trim()
}

function reset() {
  sort.value = '-1'
  isabandoned.value = ''
  isregistered.value = ''
  startdate.value = ''
  enddate.value = ''
  scope.value = '-1'
  bypasscache.value = ''
  keyword.value = '';
  pointer.value = '1';
}

  // 1. Rehydrate from URL parameters object
function rehydrate(queryParameters: Record<string, any>): { isClean: boolean }{
   
reset(); // Evict current filters to cleanly build the fresh reality

let wasClean = true

if (queryParameters && Object.keys(queryParameters).length > 0) {

  if(queryParameters.startdate){
    startdate.value = parseValue(queryParameters.startdate)
  }

  if(queryParameters.isregistered){
    isregistered.value = parseValue(queryParameters.isregistered)
  }

   if(queryParameters.isabandoned){
    isabandoned.value = parseValue(queryParameters.isabandoned)
  }

  if(queryParameters.enddate){
    enddate.value = parseValue(queryParameters.enddate)
  }

  if(queryParameters.bypasscache){
    bypasscache.value = parseValue(queryParameters.bypasscache)
  }

  if(queryParameters.keyword){
    keyword.value = parseValue(queryParameters.keyword)
  }

  if(queryParameters.scope){
    const validatedDateScope = getValidDateScope(queryParameters.scope)
    scope.value = validatedDateScope || null
    if(!validatedDateScope) wasClean = false
  }

  if(queryParameters.sort){
    const validatedSort = getValidGeneralSortType(queryParameters.sort)
    sort.value = validatedSort || null
    if(!validatedSort) wasClean = false
  }

}

    return { isClean: wasClean }
}

  
function getAsDictionary(): Record<string, string> {
  
  // 1. Collect all raw state values into a temporary workspace object
  const rawValues: Record<string, any> = {
   
      keyword: keyword.value,
      startdate: startdate.value,
      bypasscache:bypasscache.value,
      isregistered: isregistered.value,
      isabandoned: isabandoned.value,
      enddate: enddate.value,
      scope: scope.value,
      sort: sort.value,
      pointer: '1'
  }

  // 2. Create a clean payload container
  const cleanQuery: Record<string, string> = {}

  // 3. Loop through the properties and only include valid, active filters
  Object.keys(rawValues).forEach((key) => {
    const val = rawValues[key]
    
    // Skip true nulls, undefined, or empty arrays/spaces
    if (val === undefined || val === null) return
    
    const stringified = String(val).trim()
    
    // 🛡️ Skip empty strings, dropdown placeholders, and accidental leakage strings
    if (
      stringified === '' || 
      stringified === '-1' || 
      stringified === 'null' || 
      stringified === 'undefined'
    ) {
      return
    }

    // 🌟 If it passes all checks, include it in lowercase format!
    cleanQuery[key] = stringified.toLowerCase()
  })

  // 4. Return an object that ONLY has the exact keys we want visible in the URL
  return cleanQuery
}

  // 3. Build API url string
  function buildApiPath(baseRoute: string, overridePointer?: string | number, anchor?: string | null): string {
    const urlParams = new URLSearchParams();

    if (sort.value && sort.value !== '-1') 
      urlParams.append('sort', sort.value);

     if (isabandoned.value && isabandoned.value !== '') 
      urlParams.append('isabandoned', isabandoned.value);

       if (scope.value && scope.value !== '-1') {
        
      const realValue = scope.value == 'On' ? 'Between' : scope.value
      urlParams.append('scope', realValue);

      if (scope.value == 'On' && startdate.value && startdate.value.trim() !== '') 
      urlParams.append('enddate', startdate.value);
     }

     if (startdate.value && startdate.value.trim() !== '') 
      urlParams.append('startdate', startdate.value);

      if (bypasscache.value && bypasscache.value.trim() !== '') 
      urlParams.append('bypasscache', bypasscache.value);

       if (keyword.value && keyword.value.trim() !== '') 
      urlParams.append('keyword', keyword.value);

      if (enddate.value && enddate.value.trim() !== '') 
      urlParams.append('enddate', enddate.value);

        if (isregistered.value && isregistered.value.trim() !== '') 
      urlParams.append('isregistered', isregistered.value);

    const currentPointer = overridePointer ? String(overridePointer) : String(pointer.value);
      urlParams.append('pointer', currentPointer);

        if (anchor) 
      urlParams.append('anchor', anchor);

    const queryString = urlParams.toString();
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  }

  return {
    sort, startdate, enddate, scope, keyword, pointer, isregistered, bypasscache, isabandoned,
    reset, rehydrate, getAsDictionary, buildApiPath
  };
});