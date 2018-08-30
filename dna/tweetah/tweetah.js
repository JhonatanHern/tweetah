/*
	App constants
*/
var APP_ID = App.DNA.Hash,
	ME = App.Key.Hash

/*******************************************************************************
 * Utility functions
 ******************************************************************************/

/**
 * Is this a valid entry type?
 *
 * @param {any} entryType The data to validate as an expected entryType.
 * @return {boolean} true if the passed argument is a valid entryType.
 */
function isValidEntryType (entryType) {
	// Add additonal entry types here as they are added to dna.json.
	return true
}

/**
 * Returns the creator of an entity, given an entity hash.
 *
 * @param  {string} hash The entity hash.
 * @return {string} The agent hash of the entity creator.
 */
function getCreator (hash) {
	return get(hash, { GetMask: HC.GetMask.Sources })[0];
}

/*******************************************************************************
 * Required callbacks
 ******************************************************************************/

/**
 * System genesis callback: Can the app start?
 *
 * Executes just after the initial genesis entries are committed to your chain
 * (1st - DNA entry, 2nd Identity entry). Enables you specify any additional
 * operations you want performed when a node joins your holochain.
 *
 * @return {boolean} true if genesis is successful and so the app may start.
 *
 * @see https://developer.holochain.org/API#genesis
 */
function genesis () {
	console.log(ME)
	return true
}

/**
 * Validation callback: Can this entry be committed to a source chain?
 *
 * @param  {string} entryType Type of the entry as per DNA config for this zome.
 * @param  {string|object} entry Data with type as per DNA config for this zome.
 * @param  {Header-object} header Header object for this entry.
 * @param  {Package-object|null} pkg Package object for this entry, if exists.
 * @param  {string[]} sources Array of agent hashes involved in this commit.
 * @return {boolean} true if this entry may be committed to a source chain.
 *
 * @see https://developer.holochain.org/API#validateCommit_entryType_entry_header_package_sources
 * @see https://developer.holochain.org/Validation_Functions
 */
function validateCommit (entryType, entry, header, pkg, sources) {
	return isValidEntryType(entryType);
}

/**
 * Validation callback: Can this entry be committed to the DHT on any node?
 *
 * It is very likely that this validation routine should check the same data
 * integrity as validateCommit, but, as it happens during a different part of
 * the data life-cycle, it may require additional validation steps.
 *
 * This function will only get called on entry types with "public" sharing, as
 * they are the only types that get put to the DHT by the system.
 *
 * @param  {string} entryType Type of the entry as per DNA config for this zome.
 * @param  {string|object} entry Data with type as per DNA config for this zome.
 * @param  {Header-object} header Header object for this entry.
 * @param  {Package-object|null} pkg Package object for this entry, if exists.
 * @param  {string[]} sources Array of agent hashes involved in this commit.
 * @return {boolean} true if this entry may be committed to the DHT.
 *
 * @see https://developer.holochain.org/API#validatePut_entryType_entry_header_package_sources
 * @see https://developer.holochain.org/Validation_Functions
 */
function validatePut (entryType, entry, header, pkg, sources) {
	return validateCommit(entryType, entry, header, pkg, sources);
}

/**
 * Validation callback: Can this entry be modified?
 *
 * Validate that this entry can replace 'replaces' due to 'mod'.
 *
 * @param  {string} entryType Type of the entry as per DNA config for this zome.
 * @param  {string|object} entry Data with type as per DNA config for this zome.
 * @param  {Header-object} header Header object for this entry.
 * @param  {string} replaces The hash string of the entry being replaced.
 * @param  {Package-object|null} pkg Package object for this entry, if exists.
 * @param  {string[]} sources Array of agent hashes involved in this mod.
 * @return {boolean} true if this entry may replace 'replaces'.
 *
 * @see https://developer.holochain.org/API#validateMod_entryType_entry_header_replaces_package_sources
 * @see https://developer.holochain.org/Validation_Functions
 */
function validateMod (entryType, entry, header, replaces, pkg, sources) {
	return validateCommit(entryType, entry, header, pkg, sources)
		// Only allow the creator of the entity to modify it.
		&& getCreator(header.EntryLink) === getCreator(replaces);
}

/**
 * Validation callback: Can this entry be deleted?
 *
 * @param  {string} entryType Name of the entry as per DNA config for this zome.
 * @param  {string} hash The hash of the entry to be deleted.
 * @param  {Package-object|null} pkg Package object for this entry, if exists.
 * @param  {string[]} sources Array of agent hashes involved in this delete.
 * @return {boolean} true if this entry can be deleted.
 *
 * @see https://developer.holochain.org/API#validateDel_entryType_hash_package_sources
 * @see https://developer.holochain.org/Validation_Functions
 */
function validateDel (entryType, hash, pkg, sources) {
	return isValidEntryType(entryType)
		// Only allow the creator of the entity to delete it.
		&& getCreator(hash) === sources[0];
}

/**
 * Package callback: The package request for validateCommit() and valdiatePut().
 *
 * Both 'commit' and 'put' trigger 'validatePutPkg' as 'validateCommit' and
 * 'validatePut' must both have the same data.
 *
 * @param  {string} entryType Name of the entry as per DNA config for this zome.
 * @return {PkgReq-object|null}
 *   null if the data required is the Entry and Header.
 *   Otherwise a "Package Request" object, which specifies what data to be sent
 *   to the validating node.
 *
 * @see https://developer.holochain.org/API#validatePutPkg_entryType
 * @see https://developer.holochain.org/Validation_Packaging
 */
function validatePutPkg (entryType) {
	return null;
}

/**
 * Package callback: The package request for validateMod().
 *
 * @param  {string} entryType Name of the entry as per DNA config for this zome.
 * @return {PkgReq-object|null}
 *   null if the data required is the Entry and Header.
 *   Otherwise a "Package Request" object, which specifies what data to be sent
 *   to the validating node.
 *
 * @see https://developer.holochain.org/API#validateModPkg_entryType
 * @see https://developer.holochain.org/Validation_Packaging
 */
function validateModPkg (entryType) {
	return null;
}

/**
 * Package callback: The package request for validateDel().
 *
 * @param  {string} entryType Name of the entry as per DNA config for this zome.
 * @return {PkgReq-object|null}
 *   null if the data required is the Entry and Header.
 *   Otherwise a "Package Request" object, which specifies what data to be sent
 *   to the validating node.
 *
 * @see https://developer.holochain.org/API#validateDelPkg_entryType
 * @see https://developer.holochain.org/Validation_Packaging
 */
function validateDelPkg (entryType) {
	return null;
}

function validateLink(){
  return true
}

/********************************************************/

function createProfile(username){
	var profile = {
		name:username,
		address:ME
	}
	var hash = commit('profile',profile)
	hash = commit('profile_link',{
		Links:[{
			Base:APP_ID,
			Tag:'profile',
			Link:hash
		}]
	})
	return hash
}

function checkProfile() {
	try{
		var profiles = getLinks( APP_ID , 'profile' , { Load : true } )
		var me = false
		for (var i = profiles.length - 1; i >= 0; i--) {
			if(profiles[i].Entry.address === ME){
				me = profiles[i].Entry
				break
			}
		}
		return JSON.stringify(me)
	}catch(e){
		console.log('-------------------------------------------------\n')
		debug(e)
		console.log('\n-------------------------------------------------')
		return 'error'
	}
}

function checkName(name){
}

function searchProfiles() {
	return JSON.stringify(getLinks( APP_ID , 'profile' , { Load : true } ).filter(function(profile) {
			return true || profile.Entry.address !== ME
		}))
}

function follow(followHash) {
	var hash = commit('follow_link', {
		Links: [
			{
				Base: ME,
				Link: followHash,
				Tag: 'follow'
			}
		]
	})
	var hash = commit('follower_link', {
		Links: [
			{
				Base: followHash,
				Link: ME,
				Tag: 'follower'
			}
		]
	})
	return hash
}

function getFollowing(argument) {
	return getLinks(ME,'following',{Load:true})
}

function post(message) {
	var post = {
		message : message,
		timestamp : (new Date()).valueOf()
	}
	var hash = commit('post',post)

	if (!hash) {
		console.log('Error commiting post')
		debug(post)
		return ''
	}

	/*var queryOptions = {
		Return : {
			Hashes : true
		},
		Constrain : {
			EntryTypes : ["profile"],
			Count : 1
		}
	}*/
	return commit('post_link',{
		Links:[{
			Base : ME,
			Tag : 'post',
			Link : hash
		}]
	})
}

function getMyProfile() {
	return query({
		Return : {
			Hashes : true,
			Entries: true
		},
		Constrain : {
			EntryTypes : ["profile"],
			Count : 1
		}
	})[0].Entry
 }

function getFollowing() {
	return [query({
			Return : {
				Hashes : true,
				Entries: true
			},
			Constrain : {
				EntryTypes : ["profile"],
				Count : 1
			}
		})[0]]
}

function getName(hash) {
	if (hash === ME) {
		return query({
			Return : {
				Hashes : true,
				Entries: true
			},
			Constrain : {
				EntryTypes : ["profile"],
				Count : 1
			}
		})[0].Entry.name
	}
	var profiles = getLinks( APP_ID , 'profile' , { Load : true } )
	var target = false
	for (var i = profiles.length - 1; i >= 0; i--) {
		if(profiles[i].Entry.address === hash){
			target = profiles[i].Entry
			break
		}
	}
	return target.Entry.name
}

function getNames(hashArray) {
	var profiles = getLinks( APP_ID , 'profile' , { Load : true } )
	return hashArray.map( function ( hash ) {
		var target = false
		for ( var i = profiles.length - 1; i >= 0; i-- ) {
			if( profiles[ i ].Entry.address === hash ){
				return profiles[ i ].Entry
			}
		}
	})
}

function getPosts() {
	var allPosts = []
	var following = getFollowing()
	var names = getNames(following.map(function (f) {return f.Entry.address}))
	following.forEach(function(current) {
		var links = getLinks( current.Entry.address , 'post' , { Load : true } )
		links = links.map(function (l) {
			l.ownerName = names.filter(function (name) {
				return name.address === current.Entry.address
			})[0].name
			return l
		})
		allPosts = allPosts.concat(links)
	})
	return JSON.stringify(allPosts)
}