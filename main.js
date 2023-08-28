document.addEventListener("DOMContentLoaded", function () {
    const table = $("#data-table").DataTable({
        paging: true,
        searching: true,
        ordering: true,
    });

    const qualities = {"1":"Normal", "2":"Good", "3":"Outstanding","4":"Excellent","5":"Masterpiece"}

    function fetchData(apiUrl) {
        const nameJsonUrl = "name.json"; // Tên tệp JSON (nằm cùng thư mục với main.js)


        // Fetch dữ liệu từ tệp name.json
        fetch(nameJsonUrl)
            .then(response => response.json())
            .then(nameData => {
                // Tạo một đối tượng ánh xạ ID thành tên từ dữ liệu tệp JSON
                const idToNameMap = {};
                nameData.forEach(item => {
                    idToNameMap[item.good_ID] = item.good_name;
                });
                createColumnFilter2(2, "follows", nameData);


                fetch(apiUrl)
                    .then(response => response.json())
                    .then(data => {
                        table.clear().draw();

                        // Lấy danh sách các giá trị duy nhất từ cột "city" và "item_id"
                        const uniqueCities = [...new Set(data.map(item => item.city))];
                        const uniqueItemIds = [...new Set(data.map(item => idToNameMap[item.item_id] || ""))];

                        // Khởi tạo bộ lọc cho cột City và Item ID
                        createColumnFilter(1, "filter-city", uniqueCities);

                        
                        createColumnFilter(0, "filter-item", uniqueItemIds);

                        data.forEach(item => {
                            if(item.sell_price_min!==0 || item.buy_price_max!==0){

                                // Lấy tên từ đối tượng ánh xạ ID sang tên
                                const itemName = idToNameMap[item.item_id] || "";

                                const quality = qualities[item.quality] || "";
                                table.row.add([
                                    itemName,
                                    item.city,
                                    quality,
                                    item.sell_price_min,
                                    item.buy_price_max
                                ]).draw();

                            }
                            
                        });
                    
                    })
                    .catch(error => {
                        console.error("Lỗi khi lấy dữ liệu từ API: ", error);
                    });

            })
            .catch(error => {
                console.error("Lỗi khi lấy dữ liệu từ tệp name.json: ", error);
            });

        // fetch(apiUrl)
        //     .then(response => response.json())
        //     .then(data => {
        //         table.clear().draw();

        //         // Lấy danh sách các giá trị duy nhất từ cột "city" và "item_id"
        //         const uniqueCities = [...new Set(data.map(item => item.city))];
        //         const uniqueItemIds = [...new Set(data.map(item => item.item_id))];

        //         // Khởi tạo bộ lọc cho cột City và Item ID
        //         createColumnFilter(1, "filter-city", uniqueCities);
        //         createColumnFilter(0, "filter-item", uniqueItemIds);

        //         data.forEach(item => {
        //             if(item.sell_price_min!==0 || item.buy_price_max!==0){
        //                 const quality = qualities[item.quality] || "";
        //                 table.row.add([
        //                     item.item_id,
        //                     item.city,
        //                     quality,
        //                     item.sell_price_min,
        //                     item.buy_price_max
        //                 ]).draw();

        //             }
                    
        //         });
        //     })
        //     .catch(error => {
        //         console.error("Lỗi khi lấy dữ liệu từ API: ", error);
        //     });
    }

    // Hàm tạo bộ lọc cho một cột và thêm tùy chọn từ dữ liệu
    function createColumnFilter(columnIndex, selectId, uniqueValues) {
        const column = table.column(columnIndex);

        const select = $(`#${selectId}`);
        select.empty(); // Xóa tất cả các tùy chọn hiện có

        // // Thêm tùy chọn "Tất cả" vào đầu tiên
        // select.append('<option value="">Tất cả</option>');

        // Thêm các giá trị duy nhất làm tùy chọn cho thẻ select
        uniqueValues.forEach(value => {
            select.append(`<option value="${value}">${value}</option>`);
        });

        let myselect = new vanillaSelectBox(`#${selectId}`,{
            search: true,
            disableSelectAll: true
        });

        

        // Gắn sự kiện lọc khi giá trị thay     
        select.on("change", function () {
            const selectedValues = $(this).val();
            column.search(selectedValues.join("|"), true, false).draw();
        });
    }

     // Hàm tạo bộ lọc cho một cột và thêm tùy chọn từ dữ liệu
     function createColumnFilter2(columnIndex, selectId, uniqueValues) {
        const column = table.column(columnIndex);

        const select = $(`#${selectId}`);
        select.empty(); // Xóa tất cả các tùy chọn hiện có

        // // Thêm tùy chọn "Tất cả" vào đầu tiên
        // select.append('<option value="">Tất cả</option>');

        // Thêm các giá trị duy nhất làm tùy chọn cho thẻ select
        uniqueValues.forEach(value => {
            select.append(`<option value="${value.good_ID}">${value.good_name}</option>`);
        });

        let myselect = new vanillaSelectBox(`#${selectId}`,{
            search: true,
            disableSelectAll: true
        });

        const searchItem = getCookie("NMC_Albion_searchItem");
        if(searchItem !== ""){
            myselect.setValue(searchItem.split(","));
        }
        

        // Gắn sự kiện lọc khi giá trị thay     
        select.on("change", function () {
            const selectedValues = $(this).val();

            setCookie("NMC_Albion_searchItem",selectedValues.join(","),365);
           // console.log(getCookie("NMC_Albion_searchItem"));
        });
    }

    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }

    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    }

    function checkCookie() {
        let searchItem = getCookie("NMC_Albion_searchItem");
        let apiUrl = "https://east.albion-online-data.com/api/v2/stats/Prices/T4_BAG,T5_BAG,T6_BAG,T7_BAG,T8_BAG.json?qualities=1%2C2%2C3%2C4%2C5"; // Thay thế bằng URL thực tế của API

        console.log(searchItem);
        if (searchItem !== "") {
            apiUrl = "https://east.albion-online-data.com/api/v2/stats/Prices/"+searchItem+".json?qualities=1%2C2%2C3%2C4%2C5"; // Thay thế bằng URL thực tế của API

        }
        fetchData(apiUrl);
    }


    // const apiUrl = "https://east.albion-online-data.com/api/v2/stats/Prices/T7_MEAL_PIE,T5_BAG.json?qualities=1%2C2%2C3%2C4%2C5"; // Thay thế bằng URL thực tế của API

    
    checkCookie();
});
