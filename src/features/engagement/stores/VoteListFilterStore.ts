
// -- IMPORTS --
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getValidGeneralSortType, getValidDateScope, getValidVoteType, getValidLimitedContentType } from '@/utils/validators'; 

export const useVoteListFilterStore = defineStore('voteListFilter', () => {
  
// State
const startdate = ref<string | null>(null)
const enddate = ref<string | null>(null)
const scope = ref<string | null>(null)
const type = ref<string | null>(null)
const contentid = ref<string | null>(null)
const voterid = ref<string | null>(null)
const content = ref<string | null>(null)
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
  type.value = '-1'
  content.value = '-1'
  contentid.value = ''
  voterid.value = ''
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

  if(queryParameters.contentid){
    contentid.value = parseValue(queryParameters.contentid)
  }

  if(queryParameters.voterid){
    voterid.value = parseValue(queryParameters.voterid)
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
    const validatedSort = getValidGeneralSortType(queryParameters.sort)
    sort.value = validatedSort || '-1'
    if(!validatedSort) wasClean = false
  }

  if(queryParameters.content){
    const validatedContent = getValidLimitedContentType(queryParameters.content)
    content.value = validatedContent || '-1'
    if(!validatedContent) wasClean = false
  }

  if(queryParameters.type){
    const validatedType = getValidVoteType(queryParameters.type)
    type.value = validatedType || '-1'
    if(!validatedType) wasClean = false
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
      contentid: contentid.value,
      voterid: voterid.value,
      content: content.value,
      type: type.value,
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

     if (content.value && content.value !== '-1') 
      urlParams.append('content', content.value);

       if (type.value && type.value !== '-1') 
      urlParams.append('type', type.value);

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

         if (contentid.value && contentid.value.trim() !== '') 
      urlParams.append('contentid', contentid.value);

          if (voterid.value && voterid.value.trim() !== '') 
      urlParams.append('voterid', voterid.value);

    const currentPointer = overridePointer ? String(overridePointer) : String(pointer.value);
      urlParams.append('pointer', currentPointer);

        if (anchor) 
      urlParams.append('anchor', anchor);

    const queryString = urlParams.toString();
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  }

  return {
    sort, startdate, enddate, scope, keyword, pointer, username, bypasscache, content, voterid, contentid, type,
    reset, rehydrate, getAsDictionary, buildApiPath
  };
});