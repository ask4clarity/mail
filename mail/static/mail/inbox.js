document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails 
  console.log(emails);
  // could have use foreach here!
  for (let email in emails) {

    const div = document.createElement('div');
    div.innerHTML = `${emails[email].sender} ${emails[email].subject} ${emails[email].timestamp}`;
    div.className = "email";
    document.querySelector('#emails-view').append(div);
    div.onclick = function load_email() {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';
      fetch(`/emails/${emails[email].id}`)
      .then(response => response.json())
      .then(email => {
      console.log(email);
      document.querySelector('#email-view').innerHTML = ''
      const head = document.createElement('div');
      head.innerHTML = `From: ${email.sender}<br>To: ${email.recipients}<br>Subject: ${email.subject}<br>Time: ${email.timestamp}`;
      document.querySelector('#email-view').append(head);
      const body = document.createElement('p');
      body.innerHTML = `<br>${email.body}`;
      document.querySelector('#email-view').append(body);
      });

    }
  }
  
  });

}

function send_email() {

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      console.log(result);
      load_mailbox('sent');
  });
  return false;
}

function load_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // ... do something else with email ...
});
}