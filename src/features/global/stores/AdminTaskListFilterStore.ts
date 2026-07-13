
// -- IMPORTS --
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getValidContentType, getValidAdminTaskType, getValidGeneralSortType } from '@/utils/validators'; 

export const useAdminTaskListFilterStore = defineStore('adminTaskListFilter', () => {
  
// State
const type = ref<string | null>(null);

const contentid = ref<string | null>(null)
const content = ref<string | null>(null)
const all = ref<string | null>(null)
const adminid = ref<string | null>(null)
const startdate = ref<string | null>(null)
const enddate = ref<string | null>(null)
const scope = ref<string | null>(null)
const bypasscache = ref<string | null>(null)

  const username = ref<string | null>(null);
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
    sort.value = null
    type.value = null
    contentid.value = null
    all.value = null
     content.value = null
    bypasscache.value = null
    startdate.value = null
    enddate.value = null
    scope.value = null

    keyword.value = null;
    username.value = null;
    adminid.value = null;
    pointer.value = '1';
  }

  // 1. Rehydrate from URL parameters object
function rehydrate(queryParameters: Record<string, any>): { isClean: boolean }{
   
    reset(); // Evict current filters to cleanly build the fresh reality

    let wasClean = true

if (queryParameters && Object.keys(queryParameters).length > 0) {

  if(queryParameters.username){
    username.value = parseValue(queryParameters.username)
  }

  if(queryParameters.content){
      const validatedContent = getValidContentType(queryParameters.content)
      content.value = validatedContent || null
        if(!validatedContent) wasClean = false
  }

  if(queryParameters.type){
      const validatedType = getValidAdminTaskType(queryParameters.type)
      type.value = validatedType || null
      if(!validatedType) wasClean = false
  }

  if(queryParameters.contentid){
    contentid.value = parseValue(queryParameters.contentid)
  }

  if(queryParameters.all){
    all.value = parseValue(queryParameters.all)
  }

  if(queryParameters.bypasscache){
    bypasscache.value = parseValue(queryParameters.bypasscache)
  }

  if(queryParameters.startdate){
    startdate.value = parseValue(queryParameters.startdate)
  }


  if(queryParameters.enddate){
    enddate.value = parseValue(queryParameters.enddate)
  }


  if(queryParameters.scope){
    scope.value = parseValue(queryParameters.scope)
  }

  if(queryParameters.adminid){
    adminid.value = parseValue(queryParameters.adminid)
  }


  if(queryParameters.keyword){
    keyword.value = parseValue(queryParameters.keyword)
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
    username: username.value,
      type: type.value,
      contentid: contentid.value,
      all: all.value,
      keyword: keyword.value,
      content: content.value,
      bypasscache:bypasscache.value,

      startdate: startdate.value,
      enddate: enddate.value,
      scope: scope.value,
      adminid: adminid.value,

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

    if (type.value && type.value !== '-1') 
      urlParams.append('type', type.value);

    if (content.value && content.value !== '-1') 
      urlParams.append('content', content.value);

    if (keyword.value && keyword.value.trim() !== '') 
      urlParams.append('keyword', keyword.value);

    if (username.value && username.value.trim() !== '') 
      urlParams.append('username', username.value);

    if (contentid.value && contentid.value.trim() !== '') 
      urlParams.append('contentid', contentid.value);

     if (startdate.value && startdate.value.trim() !== '') 
      urlParams.append('startdate', startdate.value);

      if (enddate.value && enddate.value.trim() !== '') 
      urlParams.append('enddate', enddate.value);

      if (bypasscache.value && bypasscache.value.trim() !== '') 
      urlParams.append('bypasscache', bypasscache.value);

       if (scope.value && scope.value.trim() !== '') 
      urlParams.append('scope', scope.value);

        if (all.value && all.value.trim() !== '') 
      urlParams.append('all', all.value);

         if (adminid.value && adminid.value.trim() !== '') 
      urlParams.append('adminid', adminid.value);

    const currentPointer = overridePointer ? String(overridePointer) : String(pointer.value);
      urlParams.append('pointer', currentPointer);

        if (anchor) 
      urlParams.append('anchor', anchor);

    const queryString = urlParams.toString();
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  }

  return {
    sort, startdate, enddate, scope, all, adminid, contentid, username, type, content, keyword, pointer, bypasscache,
    reset, rehydrate, getAsDictionary, buildApiPath
  };
});