$(document).ready(function () {
  $("#generate-titles-form").on("submit", function (e) {
    e.preventDefault();
    const subject = $("#subject").val();
console.log(subject)
    // Display the popup
    $("#popup").show().addClass('d-flex');

    // Send a request to the /generate-titles/:subject route
    $.ajax({
      url: `/generate-titles/${subject}`,
      type: "GET",
      success: function (data) {
        // Update the DOM with the response data
        // (e.g., display the generated titles)
        $('#load-subject').hide()
        $('#view-subject').fadeIn()
        $('#view-subject').on('click',function(){
          window.location.href = `/titles/${subject}`
        })
        // Hide the popup
        $("#popup").hide();
      },
      error: function (error) {
        console.error("Error:", error);
        // Hide the popup
        $("#popup").hide();
      },
    });
  });

  // Function to handle article generation click event
  $(".title").on("click", function (e) {
    e.preventDefault();

    // Display the popup
    $("#popup").show().addClass('d-flex');

    // Extract the article title from the clicked element
    const articleId = $(this).data("id");
    // Send a request to the /generate-article route
    $.ajax({
      url: `/generate-article`,
      type: "POST",
      data: { articleId },
      success: function (data) {
        // Update the DOM with the response data
        // (e.g., display the generated article)
        // Assuming you have a container to display the article, for example, with an id="article-container"

        $('#load-subject').hide()
        $('#view-subject').fadeIn().text('View article')
        $('#view-subject').on('click',function(){
          window.location.href = `/article/${articleId}`
        })

        // Hide the popup
        $("#popup").hide();
      },
      error: function (error) {
        console.error("Error:", error);
        // Hide the popup
        $("#popup").hide();
      },
    });
  });

});
  
