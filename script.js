// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('lamaranForm');
    const hasilSurat = document.getElementById('hasilSurat');
    const suratContent = document.getElementById('suratContent');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Event listener untuk form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        generateSurat();
    });

    // Event listener untuk copy button
    copyBtn.addEventListener('click', function() {
        copyToClipboard();
    });

    // Event listener untuk download button: buka preview modal
    downloadBtn.addEventListener('click', function() {
        openPdfPreview();
    });

    // Fungsi untuk generate surat lamaran
    function generateSurat() {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        if (!validateForm(data)) {
            return;
        }

        const tanggalLahir = new Date(data.tanggalLahir);
        const tanggalLahirFormatted = tanggalLahir.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const tanggalSekarang = new Date();
        const tanggalSekarangFormatted = tanggalSekarang.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Kumpulkan lampiran terpilih
        const lampiran = Array.from(document.querySelectorAll('input[name="lampiran"]:checked')).map(el => el.value);

        const kotaSurat = data.kotaSurat || 'Bandung';
        const suratHTML = `<div class=\"header-surat\">${kotaSurat}, ${tanggalSekarangFormatted}</div>
<div class=\"alamat-tujuan\">Kepada Yth.<br>Bapak/Ibu HRD<br>${data.namaPerusahaan}<br>Di tempat</div>
<div class=\"salam\">Dengan hormat,</div>
<div class=\"data-pelamar\">Saya yang bertanda tangan dibawah ini:
  <div class=\"row\"><div class=\"label\">Nama</div><div class=\"colon\">:</div><div class=\"value\">${data.namaLengkap}</div></div>
  <div class=\"row\"><div class=\"label\">Tempat Tanggal Lahir</div><div class=\"colon\">:</div><div class=\"value\">${data.tempatLahir}, ${tanggalLahirFormatted}</div></div>
  <div class=\"row\"><div class=\"label\">Agama</div><div class=\"colon\">:</div><div class=\"value\">${data.agama}</div></div>
  <div class=\"row\"><div class=\"label\">Pendidikan Terakhir</div><div class=\"colon\">:</div><div class=\"value\">${data.pendidikanTerakhir}</div></div>
  <div class=\"row\"><div class=\"label\">Alamat</div><div class=\"colon\">:</div><div class=\"value\">${data.alamatLengkap}</div></div>
  <div class=\"row\"><div class=\"label\">Email</div><div class=\"colon\">:</div><div class=\"value\">${data.email}</div></div>
  <div class=\"row\"><div class=\"label\">No Telp./ WA.</div><div class=\"colon\">:</div><div class=\"value\">${data.nomorTelepon}</div></div>
</div>
<div class=\"isi-surat\">Berdasarkan informasi dari ${data.sumberInfo} ${data.namaPerusahaan} sedang membuka lowongan pekerjaan untuk posisi ${data.posisiJabatan}, maka dengan ini saya berniat mengajukan surat lamaran kerja kepada perusahaan yang Bapak/Ibu pimpin.</div>
<div class=\"dokumen-lampiran\">Sebagai bahan pertimbangan, berikut saya lampirkan dokumen:
<ol>
${lampiran.map(item => `<li>${item}</li>`).join('')}
</ol></div>
<div class=\"penutup\">Demikian surat lamaran kerja ini saya kirimkan, atas perhatiannya saya ucapkan terimakasih.</div>
<div class=\"tanda-tangan\">Hormat saya,<br><br><br>${data.namaLengkap}</div>`;

        suratContent.innerHTML = suratHTML;
        hasilSurat.style.display = 'block';
        hasilSurat.scrollIntoView({ behavior: 'smooth' });
        showMessage('Surat lamaran berhasil dibuat!', 'success');
    }

    // Fungsi validasi form
    function validateForm(data) {
        const requiredFields = [
            'namaLengkap', 'tempatLahir', 'tanggalLahir', 'agama', 'pendidikanTerakhir', 'alamatLengkap',
            'nomorTelepon', 'email', 'posisiJabatan', 'namaPerusahaan', 'sumberInfo', 'kotaSurat'
        ];

        for (let field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                showMessage(`Mohon lengkapi field ${getFieldLabel(field)}`, 'error');
                return false;
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showMessage('Format email tidak valid', 'error');
            return false;
        }

        return true;
    }

    function getFieldLabel(fieldName) {
        const labels = {
            'namaLengkap': 'Nama Lengkap',
            'tempatLahir': 'Tempat Lahir',
            'tanggalLahir': 'Tanggal Lahir',
            'kotaSurat': 'Kota Pembuatan Surat',
            'agama': 'Agama',
            'pendidikanTerakhir': 'Pendidikan Terakhir',
            'alamatLengkap': 'Alamat Lengkap',
            'nomorTelepon': 'Nomor Telepon',
            'email': 'Email',
            'posisiJabatan': 'Posisi/Jabatan',
            'namaPerusahaan': 'Nama Perusahaan',
            'sumberInfo': 'Sumber Informasi Lowongan'
        };
        return labels[fieldName] || fieldName;
    }

    // Fungsi untuk copy ke clipboard
    function copyToClipboard() {
        // Convert HTML to plain text for clipboard
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = suratContent.innerHTML;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showMessage('Surat berhasil disalin ke clipboard!', 'success');
            }).catch(() => {
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showMessage('Surat berhasil disalin ke clipboard!', 'success');
        } catch (err) {
            showMessage('Gagal menyalin ke clipboard', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    // Generate canvas dari konten surat untuk preview dan PDF
    async function generateSuratCanvas() {
        // Clone surat content untuk render akurat
        const pdfElement = suratContent.cloneNode(true);
        pdfElement.style.cssText = `
            background: white;
            padding: 25.4mm; /* 1 inch - Word Normal margins */
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            color: black;
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            border: none;
            border-radius: 0;
            box-shadow: none;
            position: absolute;
            left: -9999px;
            top: 0;
        `;

        document.body.appendChild(pdfElement);

        const canvas = await html2canvas(pdfElement, {
            scale: 4, // Meningkatkan scale untuk resolusi lebih tinggi
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 210 * 3.77953,  // 1mm ≈ 3.77953px (CSS pixel)
            height: 297 * 3.77953,
            logging: false,
            imageTimeout: 15000,
            removeContainer: true
        });

        document.body.removeChild(pdfElement);
        return canvas;
    }

    // Fungsi untuk membuka preview PDF
    async function openPdfPreview() {
        try {
            downloadBtn.classList.add('loading');
            const modal = document.getElementById('pdfPreviewModal');
            const imgEl = document.getElementById('pdfPreviewImage');
            const closeBtn = document.getElementById('previewCloseBtn');
            const dlBtn = document.getElementById('previewDownloadBtn');

            const canvas = await generateSuratCanvas();
            imgEl.src = canvas.toDataURL('image/png');

            modal.style.display = 'flex';

            // Bind actions
            closeBtn.onclick = () => { modal.style.display = 'none'; };
            modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
            dlBtn.onclick = () => downloadAsPDF(canvas);
        } catch (e) {
            console.error(e);
            showMessage('Gagal memuat preview PDF.', 'error');
        } finally {
            downloadBtn.classList.remove('loading');
        }
    }

    // Fungsi untuk download sebagai PDF
    async function downloadAsPDF(preGeneratedCanvas) {
        try {
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
            downloadBtn.disabled = true;

            const canvas = preGeneratedCanvas || await generateSuratCanvas();

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Menambahkan metadata untuk meningkatkan ukuran file
            pdf.setProperties({
                title: 'Surat Lamaran Kerja',
                subject: 'Dokumen Lamaran Pekerjaan',
                author: 'Sistem Generator Surat',
                keywords: 'surat, lamaran, kerja, pekerjaan, cv, dokumen',
                creator: 'Formulir Surat Lamaran Kerja'
            });
            
            // Menggunakan format JPEG dengan kualitas tinggi untuk ukuran file lebih besar
            const imgData = canvas.toDataURL('image/jpeg', 1.0); // Kualitas maksimal (1.0)
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Menambahkan gambar dengan resolusi tinggi
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
            
            // Menambahkan watermark untuk meningkatkan ukuran file
            pdf.setTextColor(200, 200, 200);
            pdf.setFontSize(8);
            pdf.text('Dokumen Resmi', 10, 10);
            pdf.text('Generator Surat Lamaran Kerja', 10, 285);

            const fileName = `Surat_Lamaran_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            showMessage('PDF berhasil diunduh!', 'success');

        } catch (error) {
            console.error('Error generating PDF:', error);
            showMessage('Gagal mengunduh PDF. Silakan coba lagi.', 'error');
        } finally {
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
            downloadBtn.disabled = false;
            const modal = document.getElementById('pdfPreviewModal');
            if (modal) modal.style.display = 'none';
        }
    }

    // Fungsi untuk menampilkan pesan
    function showMessage(message, type) {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        messageElement.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;

        const container = document.querySelector('.container');
        container.insertBefore(messageElement, container.firstChild);

        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
});
