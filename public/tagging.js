let toggleable = false
let filling = false
const submitButton = document.querySelector("#submit")
const skipButton = document.querySelector("#skip")
const gotoPost = document.querySelector("#link")
const showcaseDiv = document.querySelector("#showcase")
const hasTags = document.querySelector("#tags")
const addTags = document.querySelector("#added")
document.querySelector("#submit").disabled = true;
document.querySelector("#skip").disabled = true;
window.scroll({
    top: 0,
    left: 0,
    behavior: "smooth",
});
const queue = {
    items: [],
    limit: 5,
    full: false
}
const current = {}
const seenList = []
function getPathParams() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(seg => seg !== '');
    return {
        booru: segments[1] || '', //e621
        project: segments[2] || '', //charcount
        option: segments[3] || '' //0
    };
}
const { booru, project, option } = getPathParams();
async function getPosts(many, shift) {
    const url = `/api/fetch?booru=${booru}&project=${project}&option=${option}&many=${many}&shift=${shift}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}
async function updatePost(add, old) {
    const url = `/api/update`;
    const data = {
        booru,
        add,
        old,
        ID: current.post.id
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}

async function initialFetch() {
    toggleable = true;
    const optionsDiv = document.querySelector("div.options")
    optionsDiv.remove()
    let posts = await getPosts(queue.limit, 1)
    queue.items = posts
    queue.full = true
    queue.items.forEach(item => {
        seenList.push(item.id)
    })
    loadNextQueueElement()
    submitButton.disabled = false;
    skipButton.disabled = false;
}
function loadNextQueueElement() {
    let oldThing = document.querySelector("#visual")
    if (oldThing) oldThing.remove()

    let fileURL = queue.items[0].large_file_url
    if (fileURL.endsWith("mp4") || fileURL.endsWith("webm")) {
        shownMediaElement = document.createElement("video")
        shownMediaElement.setAttribute("controls", "");
        shownMediaElement.setAttribute("muted", "");
        shownMediaElement.setAttribute("autoplay", "");
    } else {
        shownMediaElement = document.createElement("img")
    }
    shownMediaElement.src = `/api/getmedia?booru=${booru}&url=${fileURL}`;
    shownMediaElement.id = "visual";
    showcaseDiv.appendChild(shownMediaElement)
    hasTags.innerHTML = queue.items[0].tag_string
    setTimeout(() => {
        submitButton.disabled = false;
        skipButton.disabled = false;
    }, 1000)
    seenList.push(queue.items[0].id)
    gotoPost.textContent = "Post #" + queue.items[0].id
    gotoPost.href = queue.items[0].postLink
    current.post = queue.items.shift()
    queue.full = queue.items.length >= queue.limit
    document.querySelectorAll(".selected").forEach(selection => {
        selectMe(selection)
    })
    if (!filling) refillQueue()
}
async function refillQueue() {
    filling = true
    let run = 1
    while (!queue.full) {
        let posts = await getPosts(queue.limit, run)
        posts.forEach(post => {
            if (!queue.items.some(item => item.id === post.id) && !seenList.includes(post.id)) {
                if (!queue.full) {
                    queue.items.push(post)
                    queue.full = queue.items.length >= queue.limit
                }
            }
        })
        run += 1
    }
    filling = false
}
function submit() {
    document.querySelector("#submit").disabled = true;
    document.querySelector("#skip").disabled = true;
    const tagsToAdd = addTags.textContent;
    const currentTags = hasTags.textContent;
    updatePost(tagsToAdd, currentTags)
    loadNextQueueElement()
}
function skip() {
    document.querySelector("#submit").disabled = true;
    document.querySelector("#skip").disabled = true;
    loadNextQueueElement()
    window.scroll({
        top: 30,
        left: 30,
        behavior: "smooth",
    });
}
function toggleResolution(element) {
    if (!element || !toggleable) return; // exit if no image found
    if (element.classList.contains("width")) {
        element.classList.replace("width", "height");
    } else if (element.classList.contains("height")) {
        element.classList.replace("height", "width");
    } else {
        element.classList.add("width");
    }
}
function selectMe(element) {
    const TagsToToggle = element.querySelector(".tags").textContent.split(" ")

    if (!element || !toggleable) return; // exit if no image found
    if (element.classList.contains("selected")) {
        element.classList.remove("selected");
        TagsToToggle.forEach(tag => {
            addTags.textContent = addTags.textContent.split(tag).join("")
        })
    } else {
        element.classList.add("selected");
        TagsToToggle.forEach(tag => {
            addTags.textContent += " " + tag
        })
    }
}