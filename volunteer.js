const feedbackForm = document.querySelector('#feedbackForm');
let submissionId = crypto.randomUUID();
feedbackForm.addEventListener('change',()=>{
 const rating=Number(new FormData(feedbackForm).get('rating'));
 feedbackForm.querySelectorAll('.star-options label').forEach((label,i)=>{label.classList.toggle('filled',i<rating);label.querySelector('[aria-hidden]').textContent=i<rating?'★':'☆';});
 document.querySelector('#ratingLabel').textContent=rating?`${rating} out of 5`:'Choose 1 to 5 stars';
});
feedbackForm.addEventListener('submit',async event=>{
 event.preventDefault();if(!feedbackForm.reportValidity())return;
 const button=feedbackForm.querySelector('button[type=submit]');if(button.disabled)return;
 const status=document.querySelector('#feedbackStatus');button.disabled=true;status.textContent='Sending your feedback…';
 const values=Object.fromEntries(new FormData(feedbackForm));values.rating=Number(values.rating);values.id=submissionId;
 try{
  const response=await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
  const data=await response.json();if(!response.ok)throw Error(data.error||'Could not send feedback. Please try again.');
  feedbackForm.hidden=true;const thanks=document.querySelector('#feedbackThanks');thanks.hidden=false;thanks.focus();submissionId=crypto.randomUUID();
 }catch(error){status.textContent=error.message;}
 finally{button.disabled=false;}
});
