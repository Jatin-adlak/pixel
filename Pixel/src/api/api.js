const BASE_URL = "${import.meta.env.VITE_API_URL}api"


/* ================= USERS ================= */

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  return res.json()
}


/* ================= POSTS ================= */

export const getPosts = async () => {
  const res = await fetch(`${BASE_URL}/posts/`)
  return res.json()
}

export const createPost = async (formData) => {
  const res = await fetch(`${BASE_URL}/posts/create/`, {
    method: "POST",
    body: formData   // ✅ FIXED (no headers)
  })

  return res.json()
}

export const deletePost = async (postId) => {
  const res = await fetch(`${BASE_URL}/posts/delete/${postId}/`, {
    method: "DELETE"
  })

  return res.json()
}


/* ================= EVENTS ================= */

export const getEvents = async () => {
  const res = await fetch(`${BASE_URL}/events/`)
  return res.json()
}

export const createEvent = async (formData) => {
  const res = await fetch(`${BASE_URL}/events/add/`, {   // ✅ FIXED
    method: "POST",
    body: formData   // ✅ FIXED (FormData)
  })

  return res.json()
}

export const deleteEvent = async (eventId) => {
  const res = await fetch(`${BASE_URL}/events/delete/${eventId}/`, {
    method: "DELETE"
  })

  return res.json()
}

export const updateEvent = async (eventId, formData) => {
  const res = await fetch(`${BASE_URL}/events/update/${eventId}/`, {
    method: "PUT",
    body: formData
  })

  return res.json()
}


/* ================= IMAGES ================= */

export const getImages = async (eventId) => {
  const res = await fetch(`${BASE_URL}/images/?event_id=${eventId}`)
  return res.json()
}

export const uploadImage = async (formData) => {
  const res = await fetch(`${BASE_URL}/images/upload/`, {
    method: "POST",
    body: formData   // ✅ FIXED
  })

  return res.json()
}

export const deleteImage = async (fileId) => {
  const res = await fetch(`${BASE_URL}/images/delete/${fileId}/`, {
    method: "DELETE"
  })

  return res.json()
}


/* ================= NEWSLETTER ================= */

export const getNewsletters = async()=>{

const res = await fetch(
"${import.meta.env.VITE_API_URL}api/newsletters/"
)

return await res.json()

}


/* ================= USER UPDATE ================= */

export const updateUsername = async (data) => {
  const res = await fetch(`${BASE_URL}/users/update-username/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    throw new Error("Failed to update username")
  }

  return res.json()
}

/* 🔥 MOMENTS */

export const getMoments = async()=>{

try{

const res = await fetch(
`${BASE_URL}/moments/`
)

return await res.json()

}catch(err){

console.log(
"GET MOMENTS ERROR:",
err
)

return []

}

}


export const createMoment = async(formData)=>{

try{

const res = await fetch(

`${BASE_URL}/moments/create/`,

{
method:"POST",
body:formData
}

)

return await res.json()

}catch(err){

console.log(
"CREATE MOMENT ERROR:",
err
)

}

}


export const deleteMoment = async(id)=>{

try{

const res = await fetch(

`${BASE_URL}/moments/delete/${id}/`,

{
method:"DELETE"
}

)

return await res.json()

}catch(err){

console.log(
"DELETE MOMENT ERROR:",
err
)

}

}

export const likeMoment=async(

momentId,
email

)=>{

const res=await fetch(

`${BASE_URL}/moments/like/`,

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

moment_id:momentId,

email

})

}

)

return await res.json()

}



export const commentMoment=async(

momentId,
email,
text

)=>{

const res=await fetch(

`${BASE_URL}/moments/comment/`,

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

moment_id:momentId,

email,
text

})

}

)

return await res.json()

}