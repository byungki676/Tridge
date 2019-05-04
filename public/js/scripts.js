/* 파일 전체에서 ESLint 규칙 경고 미사용 선언 */
/* eslint-disable */

$(function() {
  /* [#1]페이지를 스크롤 했을 때 헤더의 가독성을 높이기
     - 스크롤을 내렸을 때 배경색을 흰색으로 바꾸고 글자색도 그에 맞춰 진하게 변경
     - $(window).scroll() : 브라우저 창의 스크롤을 처리하는 함수
     - 브라우저 창(window)은 스크롤 될 때마다 'scroll' 이벤트를 발생시킴,
       따라서 스크롤 시 특정 코드를 실행하고 싶으면 $(window).scroll() 함수룰 사용해,
       스크롤 이벤트 발생시 실행할 이벤트 핸들러를 연결시키면 됨
  */
  $(window).scroll(function() {
    /* $(window).scrollTop() : 브라우저 창의 상하 스크롤 값을 가져는 함수
       - 스크롤 바가 꼭대기에 있는 상태이면 '0', 아니면 그 거리만큼의 픽셀 값을 리턴 
    */
    var top = $(window).scrollTop();      
    console.log(top);
    
    /* 스크롤 바의 위치가 꼭대기가 아니면(top>0)이면 CSS 'inverted' 클래스를 추가하고,
       아니면(top==0)이면 'inverted' 클래스를 삭제하여 헤더 가독성 문제 처리  
    */
    if (top > 0)
      $('#header').addClass('inverted');
    else
      $('#header').removeClass('inverted');
  });
  /* =========================================================== */  

   /* [#2]Datepicker 컴포넌트로 기간 입력 받기
     - 제이쿼리 UI에 속해 있는 Datepicker 컴포넌트 다운로드
     - 날짜를 입력받는 첫 번째 <input id='from>태그를 선택자로 달력 컴포넌트를 연결하고,
       객체를 dpFrom 변수에 저장
     
	 - datepicker()의 속성과 메서드를 지정하여 날짜형식과 입력가능날짜 제한 등의 기능 구현
     
   */
    
  // 시작 날짜 입력 받기 
  var dpFrom = $('#from').datepicker({
     //날짜 형식을 yy-mm-dd로 지정
     dateFormat: 'yy-mm-dd',
     /* 입력 가능한 날짜 제한 : 오늘 날자 이전을 선택할 수 없도록 minDate 속성을 0으로 지정 
        - 0: 오늘, 1:내일, -1:어제
     */
     minDate: 0,
     /* 시작 날짜가 바뀌었을 때 종료 날짜의 minDate를 그에 맞게 바꿔주는 메서드 
        - 종료 날짜가 시작 날짜보다 더 이전 날자를 선택할 수 없도록, 종료 날짜의
          'minDate' 속성을 시작 날짜에 따라 변경하도록 구현
        - onSelect() : 사용자가 특정 날짜를 선택했을 때 호출되는 이벤트 핸들러(콜백함수)
     */
     onSelect: function() {
       //dpTo(종료날짜)의 'minDate' 옵션값을, dpFrom(시작날짜)의 현재 날짜(getDate)로 설정
       dpTo.datepicker('option', 'minDate', dpFrom.datepicker('getDate'));
     }
  });

  /* 시작 날짜를 입력창에 표시 
     - datepicker()에서 setDate 함수를 호출하여 오늘 날짜로 설정 
     - setDate를 인자로 전달하면 라이브러리가 그 인자를 사용하여 setDate 함수를 호출함
  */
  dpFrom.datepicker('setDate', new Date());
    
  //종료 날짜 입력 받기
  var dpTo = $('#to').datepicker({
    //날짜 형식을 yy-mm-dd로 지정
    dateFormat: 'yy-mm-dd',
    // 입력 가능한 날짜 제한
    minDate: 0
  });

  /* 종료 날짜를 입력창에 표시 
     - datepicker()에서 setDate 함수를 호출하여 종료 날짜를 설정
     - new Date()가 아닌 4로 설정하면 오늘 날자에 4를 더한 날자를 종료 날자로 표시
  */
  dpTo.datepicker('setDate', 4);
  /* =========================================================== */     
    
  /* [#3] 검색 기능 구현하기
     - 기간 입력폼에서 submit 이벤트가 발생하면, 브라우저의 submit 기본동작(action속성)을 정지시키고
       시작과 종료날짜를 가져와 서버에 여행지 목록을 요청하는 search()함수를 호출
       
     - 날짜를 입력받는 첫 번째 <input id='from>태그를 선택자로 달력 컴포넌트를 연결하고,
       객체를 dpFrom 변수에 저장
     - datepicker()의 속성과 메서드를 지정하여 날짜형식과 입력가능날짜 제한 등의 기능 구현
     
   */
    
  //$('#form-search').submit()함수로 폼의 서브밋 이벤트 핸들러 선언
  $('#form-search').submit(function(e) {
    
	e.preventDefault(); // window action 정지 시키기.

    var from = $('#from').datepicker().val();
	  
    var to = $('#to').datepicker().val();

    //서버에 여행지 목록 요청(시작일, 종료일)
    search(from, to);
  });
});

//서버에 여행지 목록을 요청하는 함수
function search(from, to) {
  //서버 url
  var url = 'https://javascript-basic.appspot.com/searchLocation';

  //$.getJSON() 함수로 Ajax 요청(여행지 목록 요청)
  $.getJSON(url, {
    from: from,
    to: to
  }, function(list) {
    var arr = [];     
    
    /* 서버로 부터 리턴된 여행지 목록 객체에 id 속성 설정 
       - 여행지 목록을 클릭하면 상세보기 페이지로 이동할 때,
         각 여행지를 구분하기 위해 id 속성을 사용하여 쿼리스트링 형식으로 url을 생성함
    */
    for (var key in list) {
      //list 객체에 key 프로퍼티가 있는지 확인
      if (list.hasOwnProperty(key)) {
        //obj 객체 변수 선언
        var obj = list[key];
        // key 값을 숫자로 변환하여 obj객체의 id 속성값으로 설정
        obj.id = Number(key);  
        
        console.log('obj.id :' + obj.id);
        
        //obj객체(배열)를 arr객체에 추가
        arr.push(obj);
      }
    }

    //id 속성이 추가된 여행지 목록 객체를 list 객체에 할당
    list = arr;

    // 여행지 목록 표시할 #list-panel을 획득하여 $list 변수에 저장
    var $list = $('#list-panel');

    // 서버로부터 받은 여행지 목록을 반복문을 이용해 처리
    for (var i = 0; i < list.length; i++) {
      var data = list[i];

      /* 서버로 부터 받은 여행지 목록을 한 개씩 createListItem() 함수에 넘겨,
         각각의 생성된 목록 엘리먼트를 리턴받아 $list에 여행지 목록 표시
      */
      var $item = createListItem(data);

      //여행지 목록 엘리먼트를 $list에 추가
      $list.append($item);
    }
      
    // 숨겨 놓았던(display: none) '#list-bg'가 화면에 보이도록 show()함수 호출
    $('#list-bg').show();
  });
}

/* 템플릿 엘리먼트를 사용해서 각각의 여행지를 표시할 여행지 목록 엘리먼트를 생성하는 함수 
   - 생성한 여행지 목록 엘리먼트를 리턴
*/
function createListItem(data) {
  /* 여행지를 표시할 템플릿('#list-item-template')을 복제하고,
     id의 중복을 막기 위해 id 속성 제거
  */
  var $tmpl = $('#list-item-template').clone().removeAttr('id');
  
  // 여행지의 대표 이미지가 '.list-item-image'에 표시되도록 src 속성으로 이미지 설정
  $tmpl.find('.list-item-image').attr('src', data.titleImageUrl);
  // 여행지 이름 설정
  $tmpl.find('.list-item-name').html(data.name);
  // 도시명 설정
  $tmpl.find('.list-item-city-name').html(data.cityName);

  /* 여행지 목록에 클릭 이벤트 핸들러 설정
     - 각 여행지 목록을 클릭했을 때 각 여행지의 '상세보기' 페이지로 이동하기 위한 핸들러
  */
  $tmpl.click(function(e) {
    /* 상세보기 페이지('detail.html')로 이동하는 url을 만들 때,
       각 여행지를 구분하기 위해 id 속성을 사용하여 쿼리스트링 형식으로 id값을 넘겨준다.
       - url : detail.html + 쿼리스트링(?id=각 여행지 목록의 id값) 
    */
    var url = 'detail.html?id=' + data.id;
  
    // 해당 url로 페이지 이동
    window.location = url;
  });

  //생성한 여행지 목록 리턴
  return $tmpl;
}