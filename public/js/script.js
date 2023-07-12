function PostArticle() {
    // Display the popup
    $("#popup").show().addClass('d-flex');
    $('#popup p').text('Please wait while we are posting your article');
    const articleId = event.target.getAttribute('data-id');
    fetch('/post-article', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            $('#popup p').text('Article posted successfully!');
        } else {
            $('#popup p').text('Failed to post article: ' + data.message);
        }
        // Hide the popup
        $('#load-subject').hide()
        $('#view-subject').fadeIn()
        $('#view-subject').on('click',function(){
          window.location.href = `/article/${articleId}`
        })
        $("#popup").hide();
    })
    .catch((error) => {
        console.log(error);
        // Hide the popup
        $("#popup").hide();
    });
}
