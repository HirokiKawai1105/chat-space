$(document).on('turbolinks:load', function(){ 
  $(function(){
    function buildHTML(message){
      var content = message.content ? `${message.content}` : ""
      var image = message.image ? `<img class="lower-message__image" src=${message.image}>` : ""

      var html = 
    `<div class="message" data-message_id="${message.id}">
      <div class="upper-message">
        <div class="upper-message__user-name">
          ${message.name}
        </div>
        <div class="upper-message__date">
          ${message.date}
        </div>
      </div>
      <div class="lower-message">
        <p class="lower-message__content">
          ${content}
        </p> 
      </div>  
        ${image}
      </div>`
      return html;
    }
    $('#new_message').on('submit',function(e){
      e.preventDefault();
      var formData = new FormData(this);
      var url = $(this).attr('action')
      $.ajax({
        url: url,
        type: "POST",
        data: formData,
        dataType: 'json',
        processData: false,
        contentType: false
      })
      .done(function(data){
        var html = buildHTML(data);
        $('.messages').append(html)
        $('')
        $('#new_message')[0].reset();
        $('.messages').animate({scrollTop: $('.message').last().offset().top + $('.messages').scrollTop()}, 1000, 'swing'); 
      })
      .fail(function(){
        alert('ボタン連打しすぎ！ダメ絶対！');
      })
    .always(function(){
      $('.form__submit').prop('disabled', false);
    })
  })
    var reloadMessages = function() {
        var last_message_id = $('.messages .message:last-child').data('message_id')
        $.ajax({
          url: './api/messages',
          type: 'get',
          dataType: 'json',
          data: {id: last_message_id}
        })
        .done(function(messages) {

          var insertHTML = '';
          $.each(messages, function(index, message) {
            insertHTML += buildHTML(message)
          })
          $('.messages').append(insertHTML)
          $('.messages').animate({scrollTop: $('.message').last().offset().top + $('.messages').scrollTop()}, 1000, 'swing'); 
        })
        .fail(function(){
          //alert('自動更新失敗');
        });
    }
    if (window.location.href.match(/\/groups\/\d+\/messages/)){
      setInterval(reloadMessages, 5000);
    }
  });
});