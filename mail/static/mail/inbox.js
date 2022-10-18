document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get mail for mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Loop through email and creat div for each
    emails.forEach(singleEmail => {

    console.log(singleEmail);

    const newEmail = document.createElement('div');
    newEmail.className = "list-group-item";
    newEmail.innerHTML = `
    <h6>sender: ${singleEmail.sender}</h6>
    <h6>subject: ${singleEmail.subject}</h6>
    <p> ${singleEmail.timestamp}</p>
    `;

    // change background color
    newEmail.className = singleEmail.read ? 'read': 'unread';
    
    newEmail.addEventListener('click', function() {
        view_email(singleEmail.id)
    }); 
      document.querySelector('#emails-view').append(newEmail);
      })
});
}

function send_email(event){
  event.preventDefault();
  // store fields
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // sent date to backen
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('send');
  });

}

function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      //change to read
      if(!email.read){
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      }

      
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-detail-view').style.display = 'block';

      document.querySelector('#emails-detail-view').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><strong>From :<strong>${email.sender}</li>
        <li class="list-group-item"><strong>To :<strong>${email.recipients}</li>
        <li class="list-group-item"><strong>Subject :<strong>${email.subject}</li>
        <li class="list-group-item"><strong>timestamp :<strong>${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
      </ul>
      `

      //Archive and Unarchive
      const btn_arch = document.createElement('button');
      btn_arch.innerHTML = email.archived ? 'Unarchive' : 'Archive';
      btn_arch.className = email.archived ? 'btn btn-danger' : 'btn btn-success';
      btn_arch.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then(() => { load_mailbox ('archive')})
      });
      document.querySelector('#emails-detail-view').append(btn_arch);
      
      //reply
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = 'Reply'
      btn_reply.className = 'btn btn-primary';
      btn_reply.addEventListener('click', function() {
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;
        let subject = email.subject;
        if(subject.split(' ',1)[0] != 'Re:'){
          subject = 'Re: ' + email.subject;
        }
        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote :${email.body}`;
      });
      document.querySelector('#emails-detail-view').append(btn_reply);
});
}
  
