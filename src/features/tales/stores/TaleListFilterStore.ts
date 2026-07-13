
// -- IMPORTS --
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getValidSortType, getValidDateScope, getValidTaleStatus, getValidCountry, getValidCategory
} from '@/utils/validators'; 

export const useTaleListFilterStore = defineStore('taleListFilter', () => {
  
// State
const startdate = ref<string | null>(null)
const enddate = ref<string | null>(null)
const scope = ref<string | null>(null)
const status = ref<string | null>(null)
const creatorid = ref<string | null>(null)
const tag = ref<string | null>(null)
const country = ref<string | null>(null)
const category = ref<string | null>(null)
const username = ref<string | null>(null)
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
  status.value = '-1'
  creatorid.value = ''
  category.value = '-1'
  tag.value = ''
  country.value = '-1'
  username.value = ''
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

  if(queryParameters.username){
    username.value = parseValue(queryParameters.username)
  }

  if(queryParameters.tag){
    tag.value = parseValue(queryParameters.tag)
  }

  if(queryParameters.creatorid){
    creatorid.value = parseValue(queryParameters.creatorid)
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
    scope.value = validatedDateScope || '-1'
    if(!validatedDateScope) wasClean = false
  }

  if(queryParameters.sort){
    const validatedSort = getValidSortType(queryParameters.sort)
    sort.value = validatedSort || '-1'
    if(!validatedSort) wasClean = false
  }

  if(queryParameters.status){
    const validatedStatus = getValidTaleStatus(queryParameters.status)
    status.value = validatedStatus || '-1'
    if(!validatedStatus) wasClean = false
  }

  if(queryParameters.country){
    const validatedCountry = getValidCountry(queryParameters.country)
    country.value = validatedCountry || '-1'
    if(!validatedCountry) wasClean = false
  }

  if(queryParameters.category){
    const validatedCategory = getValidCategory(queryParameters.category)
    category.value = validatedCategory || '-1'
    if(!validatedCategory) wasClean = false
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
      username: username.value,
      creatorid: creatorid.value,
      category: category.value,
      tag: tag.value,
      country: country.value,
      status: status.value,
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

       if (status.value && status.value !== '-1') 
      urlParams.append('status', status.value);

       if (category.value && category.value !== '-1') 
      urlParams.append('category', category.value);

       if (country.value && country.value !== '-1') 
      urlParams.append('country', country.value);

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

        if (username.value && username.value.trim() !== '') 
      urlParams.append('username', username.value);

         if (tag.value && tag.value.trim() !== '') 
      urlParams.append('tag', tag.value);

         if (creatorid.value && creatorid.value.trim() !== '') 
      urlParams.append('creatorid', creatorid.value);

    const currentPointer = overridePointer ? String(overridePointer) : String(pointer.value);
      urlParams.append('pointer', currentPointer);

        if (anchor) 
      urlParams.append('anchor', anchor);

    const queryString = urlParams.toString();
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  }

  return {
    sort, startdate, enddate, scope, keyword, pointer, username, bypasscache, country, category, tag, creatorid, status,
    reset, rehydrate, getAsDictionary, buildApiPath
  };
});