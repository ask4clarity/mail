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
  // Loop through emails
  for (let email in emails) {

    const div = document.createElement('div');
    if (emails[email].read && mailbox === 'inbox') {
      div.style.backgroundColor = 'LightGrey';
    }
    else {
      div.style.backgroundColor = 'white';
    }
    div.innerHTML = `${emails[email].sender} ${emails[email].subject} ${emails[email].timestamp}`;
    div.className = "email";
    document.querySelector('#emails-view').append(div);
    div.addEventListener('click', () => load_email(emails[email].id, mailbox));

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

function load_email(id, mailbox) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
            read: true
    })
  })

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
  console.log(email);
  document.querySelector('#email-view').innerHTML = `
  <div>From: ${email.sender}</div>
  <div>To: ${email.recipients}</div>
  <div>Subject: ${email.subject}</div>
  <div>Timestamp: ${email.timestamp}</div>            
  <hr>
  <div>
      ${email.body}
  </div>
  <hr>
  <div class="email-buttons">
  <button id="reply">Reply</button>
  <button id="archive">${email["archived"] ? "Unarchive" : "Archive"}</button>
  </div>  
`;

if (mailbox === 'sent') {
  document.querySelector('.email-buttons').style.display = 'none';
}

document.querySelector('#archive').addEventListener('click', () => {
  fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: !email.archived
      })
  })
  .then(result => {
    console.log(result);
    load_mailbox('inbox');
  }); 
})

document.querySelector('#reply').addEventListener('click', () => {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  
  if (email.subject.includes('Re:')) {
    document.querySelector('#compose-subject').value = `${email.subject}`;
  }
  else {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }

  document.querySelector('#compose-body').value = `"On ${email.timestamp} ${email.sender} wrote:"\n${email.body}\n` ;
   
})


});
  
}