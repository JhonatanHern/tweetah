const qs = s => Array.from(document.querySelectorAll(s))
const bid = s => document.getElementById(s)

const UI = {
	openMenu : function () {
		document.getElementById('nav-check').checked = 'true'
	},
	closeMenu : function () {
		document.getElementById('nav-check').checked = ''
	},
	showLoading : function () {
		document.getElementById('loading').style.display = 'block'
	},
	hideLoading : function () {
		document.getElementById('loading').style.display = 'none'
	}
}

const me = {
	name : '',
	followers : [],
	following : []
}

function searchPeople() {
	return new Promise( ( succ , error ) => {
		fetch( '/fn/tweetah/searchProfiles' , {
			method : 'POST' ,
			body : ''
		})
		.then( r => r.json( ) )
		.then( data => {
			succ(data)
		})
		.catch(err=>{
			error(err)
		})
	})
}

const createFollowButton = ( options = {} ) => {
	const button = document.createElement('button')
	if (options.click && options.click instanceof Function) {
		button.addEventListener('click',options.click)
	}
	button.innerText = 'follow'
	return button
}

const actions = {
	followPeople : async () => {//search registered people
		qs('body > section').forEach(section=>{
			section.style.display = 'none'
		})
		bid('section-search').style.display = 'block'
		UI.showLoading()
		let data = await searchPeople()
		bid( 'members-to-follow' ).innerHTML = ''
		if ( data && Array.isArray( data ) ) {
			let div = document.createElement( 'div' )
			data.forEach( person => {
				let a = document.createElement('a')
				a.innerText = '@' + person.Entry.name + ' '
				a.href = person.Hash
				a.appendChild( createFollowButton({
						click:e => {
							e.preventDefault()
							actions.follow(a.href)
						}
					})
				)
				a.addEventListener('click',e=>e.preventDefault())
				div.appendChild( a )
			})
			bid( 'members-to-follow' ).appendChild( div )
		}
		UI.hideLoading()
	},
	follow : hash => {
		fetch('/fn/tweetah/follow',{
			method:'POST',
			body:hash
		})
		.then(r=>r.text())
		.then(text=>{
			console.log(text)
		})
		.catch(err=>{
			console.log(err)
		})
	}
}

const checkProfile = ( ) => {
	return new Promise( ( success , error ) => {
		fetch( '/fn/tweetah/checkProfile' , {
				method:'POST',
				body:''
			})
			.then( r => r.json( ) )
			.then( json => {
				success( json )
			}).catch( err => {
				error( err )
			})
	})
}

function createProfile( name ) {
	return new Promise( ( succ , error ) => {
		if ( !name || !/^\w*$/.test( name ) ) {
			alert('nombre no permitido')
			error(m)
			return
		}
		fetch( '/fn/tweetah/createProfile' , {
			method: 'POST' ,
			body: name
		})
		.then( r => r.text( ) )
		.then( text => {
			succ( text )
		})
	})
}

function updatePosts() {
	fetch('/fn/tweetah/getPosts',{
		method:'POST',
		body:''
	})
	.then(r=>r.json())
	.then(data=>{
		data = data.sort((a,b)=>{
			return a.Entry.timestamp < b.Entry.timestamp
		})
		let postsArea = bid('posts')
		postsArea.innerText = ''
		data.forEach(post=>{
			let div = document.createElement('div'),
				span = document.createElement('span'),
				p = document.createElement('p')

			span.innerText = post.ownerName
			p.innerText = post.Entry.message
			div.appendChild(span)
			div.appendChild(p)
			postsArea.appendChild(div)
		})
	})
}

function post (){
	let message = document.getElementById('roar-text').value
	if (!message) {
		return
	}
	document.getElementById('roar-text').value = ''
	fetch('/fn/tweetah/post',{
		method:'POST',
		body:message
	})
	.then(r=>r.text())
	.then(text=>{
		console.log(text)
		updatePosts()
	})
	.catch(err=>{
		console.log(err)
	})
}

async function main() {
	let response
	try{
		response = await checkProfile()
	}catch(e){
		console.log('Error')
		console.log(e)
		setTimeout(main,1000)
		return
	}
	if (!response) {//profile not created yet
		try{
			let name
			await createProfile( name = prompt( 'Insert a username' ) )
			document.getElementById('nav-name').innerText = '@' + name
			me.name = name
		}catch(e){
			console.log(e)
		}
	}else{
		//set username in user interface
		document.getElementById('nav-name').innerText = '@' + response.name
		me.name = response.name
	}
	UI.hideLoading()
	assignEvents()
}

function assignEvents() {
	document.getElementById('roar-button').addEventListener('click',post)
	Array.from(document.getElementsByClassName('inner-link')).forEach(link=>{
		link.addEventListener('click',(e) => {
			UI.closeMenu()
			let attribute = link.getAttribute('data-action')
			if (actions.hasOwnProperty(attribute)) {
				actions[attribute]()
			}
		})
	})
}

main()