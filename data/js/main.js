var id_kategori = 0;
var kategori = null;
var materi = null;
var id_materi_edit = 0
function getAllData() {
    firebase.database().ref('kategori').once('value').then(function (snapshot) {
        kategori = snapshot.val();
        $('.kategori').empty();
        $('#kategori-materi').empty()
        kategori.forEach(function (it) {
            var html =
                `<li class="item-kat" onclick="getKategori(event, ${it.id_kategori})">${it.name}</li>
                `;
            $('.kategori').append(html);
            var html1 = `<option value="${it.id_kategori}">${it.name}</option>`
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
                                        <button class="btn btn-success btn-sm" data-toggle="modal" data-target="#editModal" onclick="showMateriDetail(${it.id_materi})">Edit</button>
                                        <button class="btn btn-danger btn-sm" onclick="deleteMateri(${it.id_materi})">Delete</button>
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
    $($('li')[id]).addClass('active');
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
                                        <button class="btn btn-success btn-sm" data-toggle="modal" data-target="#editModal" onclick="showMateriDetail(${it.id_materi})">Edit</button>
                                        <button class="btn btn-danger btn-sm" onclick="deleteMateri(${it.id_materi})">Delete</button>
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
                                        <button class="btn btn-success btn-sm" data-toggle="modal" data-target="#editModal" onclick="showMateriDetail(${it.id_materi})">Edit</button>
                                        <button class="btn btn-danger btn-sm" onclick="deleteMateri(${it.id_materi})">Delete</button>
                                    </div>
                                </div>
                            </div>
                    `;
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
    $('#konten-materi').on('input', () => {
        var text = $('#konten-materi').val()
        $('#preview-konten').empty()
        $('#preview-konten').append(text)
    })
    $('#addMateri').on('hidden.bs.modal', function () {
        $('#judul-materi').val("");
        $('#konten-materi').val("");
        $('#gambar-materi').val(null);
        $('#preview-gambar').attr('src', '');
        $('#preview-konten').html("");
    });
})
function validateAndUpload() {
    var isJudulExist = $('#judul-materi').val().length != 0
    var isMateriExist = $('#konten-materi').val().length != 0
    var isImgTypeRight = true
    var img = $('#gambar-materi').prop('files')[0]
    var regex = new RegExp("(.*?)\.(jpg|jpeg|png)$");

    if (img) {
        var imgName = img.name.toLowerCase()
        isImgTypeRight = regex.test(imgName)
    }
    if (isImgTypeRight && isJudulExist && isMateriExist) {
        Swal.fire({
            title: 'Anda yakin untuk menambah materi baru?',
            text: 'Pastikan semua data yang anda masukkan telah benar',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Lanjutkan'
        }).then((res) => {
            if (res.value) {
                var key = Date.now()
                var idMateri = materi.length
                var judulMateri = $('#judul-materi').val()
                var kategoriMateri = Number($("#kategori-materi").val())
                var kontenMateri = $('#konten-materi').val()
                var gambarMateri = ""
                Swal.fire({
                    title: 'Mengunggah Materi ke Database',
                    html: `<div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0"
                aria-valuemin="0" aria-valuemax="100"></div>
            </div>`,
                    onBeforeOpen: () => {
                        Swal.showLoading()
                    },
                    onOpen: () => {

                        if (img) {
                            var ref = firebase.storage().ref();
                            var metadata = {
                                contentType: img.type
                            };
                            var task = ref.child(judulMateri).put(img, metadata);
                            task
                                .on('state_changed', function (snapshot) {
                                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                    $('.progress-bar').css('width', progress + "%");
                                })
                            task.then(() => {
                                firebase.database().ref('materi/' + (idMateri)).set({
                                    id_materi: idMateri,
                                    id_kategori: kategoriMateri,
                                    img: judulMateri,
                                    title: judulMateri,
                                    content: kontenMateri
                                }).then(() => {
                                    firebase.database().ref('/').update({
                                        dataKey: key
                                    }).then(() => {
                                        Swal.hideLoading()
                                        Swal.fire(
                                            'Sukses!',
                                            'Berhasil Memasukkan Data!',
                                            'success'
                                        )
                                        getAllData()
                                        $('#addMateri').modal('hide')
                                    })
                                })

                            })
                        } else {
                            firebase.database().ref('materi/' + (idMateri)).set({
                                id_materi: idMateri,
                                id_kategori: kategoriMateri,
                                img: gambarMateri,
                                title: judulMateri,
                                content: kontenMateri
                            }).then(() => {
                                firebase.database().ref('/').update({
                                    dataKey: key
                                }).then(() => {
                                    Swal.hideLoading()
                                    Swal.fire(
                                        'Sukses!',
                                        'Berhasil Memasukkan Data!',
                                        'success'
                                    )
                                    getAllData()
                                    $('#addMateri').modal('hide')
                                })
                            })
                        }
                    }
                    // allowOutsideClick: 0
                })
            }
        })
    } else {
        Swal.fire(
            'Format belum benar',
            'Pastikan Judul dan Materi telah diisi. Jika ada gambar, pastikan format gambar adalah jpg, jpeg, atau png',
            'error'
        )
    }
}
function addKategori() {
    var id = kategori.length;
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
            return firebase.database().ref('kategori/' + id).set({
                id_kategori: id,
                name: insert
            }).then((response) => {
                firebase.database().ref('/').update({
                    dataKey: key
                })
                    .then(() => {
                        return true;
                    })
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
function deleteMateri(id) {
    var materiName = materi[id].title
    Swal.fire({
        title: 'Hapus materi?',
        text: "Anda yakin ingin menghapus " + materiName,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Hapus'
    }).then((result) => {
        if (result.value) {
            firebase.database().ref('materi/' + id).remove()
            return true;
        }
        return false;
    }).then((res) => {
        if (res) {
            firebase.database().ref('/').update({
                dataKey: Date.now()
            }).then(() => {
                Swal.fire(
                    'Terhapus!',
                    'Materi telah dihapus',
                    'success'
                )
                getAllData()
            })
        }
    })
}
function showMateriDetail(id) {
    var m = materi[id]
    id_materi_edit = id
    $('#judul-edit').val(m.title)
    $('#konten-edit').val(m.content)
    $('#preview-edit').html(m.content)
    if (m.img.length != 0) {
        var url = firebase.storage().ref().child(m.title).getDownloadURL()
            .then((url) => {
                $('#preview-gambar-edit').attr('src', url)
            })
    }
}
function editMateri() {

    Swal.fire({
        title: 'Anda yakin untuk mengubah materi ini?',
        text: 'Pastikan semua data yang anda masukkan telah benar',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Lanjutkan'
    }).then((res) => {
        if (res.value) {
            var newJudul = $('#judul-edit').val()
            var newKonten = $('#konten-edit').val()
            firebase.database().ref('/materi/' + id_materi_edit).update({
                title: newJudul,
                content: newKonten
            }).then(() => {
                firebase.database().ref('/').update({
                    dataKey: Date.now()
                }).then(() => {
                    Swal.hideLoading()
                    Swal.fire(
                        'Sukses!',
                        'Berhasil Mengubah Data!',
                        'success'
                    )
                    getAllData()
                    $('#editModal').modal('hide')
                })

            })
        }
    })

}