import '../styles/index.scss';

// console.log('App is running on the browser too!');

function postLikeEvent(event) {
  event.preventDefault();
  const form = event.currentTarget;
  fetch(form.action, {
    // eslint-disable-next-line
    method: (form.elements._method && form.elements._method.value) || 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      userId: form.elements.userId && form.elements.userId.value,
    }),
    credentials: 'include',
  })
    .then(response => response.json())
    .then((data) => {
      const wrapper = form.parentNode;
      wrapper.innerHTML = data.response;
      wrapper.querySelector('form').addEventListener('submit', postLikeEvent);
    })
    .catch(() => { /* something went wrong, but idc */ });
}

document.querySelectorAll('.post-like-bar form').forEach(form => form.addEventListener('submit', postLikeEvent));
