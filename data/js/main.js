var id_kategori = 1;
var kategori = null;
var materi = null;
function getAllData() {
    firebase.database().ref('kategori').once('value').then(function (snapshot) {
        kategori = snapshot.val();
        $('.kategori').empty();
        kategori.forEach(function (it) {
            var html =
                `<li class="item-kat" onclick="getKategori(event, ${it.id_kategori})">${it.name}</li>
                `;
            $('.kategori').append(html);
            var html1 = `<option value="${it.name}">${it.name}</option>`
            $('#kategori-materi').append(html1)
        })
    }).then(() => {
        $($('.item-kat')[0]).addClass('active');
        firebase.database().ref('materi').once('value').then(function (snapshot) {
            materi = snapshot.val();
            $('.materi').empty();
            materi.forEach(it => {
                var html = `
                    <div class="card">
                                <div class="row">
                                    <div class="col-lg-9">
                                        <h4>${it.title}</h4>
                                    </div>
                                    <div class="col-lg-3">
                                        <a href="./data/html/edit.html?id=${it.id_materi}"><button class="btn btn-success btn-sm">Edit</button></a>
                                        <button class="btn btn-danger btn-sm" onclick="deleteMateri()">Delete</button>
                                    </div>
                                </div>
                            </div>
                    `;
                $('.materi').append(html);
            });
        });
    });
}
getAllData();
function getKategori(event, id) {
    id_kategori = id;
    $('li.active').removeClass('active');
    $($('li')[id - 1]).addClass('active');
    getMateri(id);
}
function getMateri(id_kategori) {
    $('.materi').empty();
    materi.forEach((it) => {
        if (it.id_kategori == id_kategori) {
            var html = `
                    <div class="card">
                                <div class="row">
                                    <div class="col-lg-9">
                                        <h4>${it.title}</h4>
                                    </div>
                                    <div class="col-lg-3">
                                        <a href="./data/html/edit.html?id=${it.id_materi}"><button class="btn btn-success btn-sm">Edit</button></a>
                                        <button class="btn btn-danger btn-sm" onclick="deleteMateri()">Delete</button>
                                    </div>
                                </div>
                            </div>
                    `;
            $('.materi').append(html);
        }
    })
}
$(document).ready(() => {
    $('.cari-materi').on('input', () => {
        var q = $('.form-control').val()
        $('.materi').empty()
        materi.forEach((it) => {
            if (it.title.toLowerCase().includes(q.toLowerCase())) {
                var html = `
                        <div class="card">
                                    <div class="row">
                                        <div class="col-lg-9">
                                            <h4>${it.title}</h4>
                                        </div>
                                        <div class="col-lg-3">
                                            <a href="./data/html/edit.html?id=${it.id_materi}"><button class="btn btn-success btn-sm">Edit</button></a>
                                            <button class="btn btn-danger btn-sm" onclick="deleteMateri()">Delete</button>
                                        </div>
                                    </div>
                                </div>
                        `
                $('.materi').append(html)
            }
        })
    })
    bsCustomFileInput.init()
    $('#gambar-materi').on('change', () => {
        console.log('onchange!')
        var img = $('#gambar-materi').prop('files')[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#preview-gambar').attr('src', e.target.result).fadeIn('slow');
        }
        reader.readAsDataURL(img);

    })
    $('#konten-materi').on('input', () =>{
        var text = $('#konten-materi').val()
        $('#preview-konten').empty()
        $('#preview-konten').append(text)
    })
})
function addKategori() {
    var id = kategori.length + 1;
    Swal.fire({
        title: 'Tambah Kategori',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        inputValidator: (value) => {
            if (!value) {
                return 'Kategori tidak boleh kosong!';
            }
        },
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya',
        preConfirm: (insert) => {
            return firebase.database().ref('kategori/' + (id - 1)).set({
                id_kategori: id,
                name: insert
            }).then((response) => {
                return true;
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((response) => {
        if (response.value) {
            Swal.fire(
                'Berhasil!',
                'Berhasil menambahkan kategori',
                'success'
            )
            getAllData();
        }
    });
}
