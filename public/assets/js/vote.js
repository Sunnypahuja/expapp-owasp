async function vote(item) {
  console.log('test');
  const response = await fetch('/vote', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({ item }),
  });
  const request = await fetch('/votes', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify({ item }),
  });
}
  document.getElementById('vote-BJP').addEventListener('click', function () {
    vote('BJP');
  });
document.getElementById('vote-INC').addEventListener('click', function () {
  vote('INC');
});
document.getElementById('vote-AAP').addEventListener('click', function () {
  vote('AAP');
});
document.getElementById('vote-BSP').addEventListener('click', function () {
  vote('BSP');
});


  


