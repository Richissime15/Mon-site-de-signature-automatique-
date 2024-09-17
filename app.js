	// Afficher les fichiers téléchargés
	document.getElementById('pdfFiles').addEventListener('change', function () {
		const pdfFiles = this.files;
		const fileList = document.getElementById('fileList');
		fileList.innerHTML = ''; // Efface la liste précédente

		for (let i = 0; i < pdfFiles.length; i++) {
			const li = document.createElement('li');
			li.textContent = pdfFiles[i].name;
			fileList.appendChild(li);
		}
	});

	// Gérer la signature des documents
	document.getElementById('sign-btn').addEventListener('click', async function () {
		const pdfFiles = document.getElementById('pdfFiles').files;
		const status = document.getElementById('status');
		const downloadSection = document.getElementById('download-section');
		const signedDocs = document.getElementById('signedDocs');
		
		if (pdfFiles.length === 0) {
			alert("Veuillez téléverser des fichiers PDF à signer.");
			return;
		}

		status.classList.remove('hidden');
		status.textContent = "Signature en cours...";

		signedDocs.innerHTML = ''; // Efface les anciens fichiers

		for (let i = 0; i < pdfFiles.length; i++) {
			const file = pdfFiles[i];
			const signedPdf = await signPdf(file);
			
			const a = document.createElement('a');
			a.href = URL.createObjectURL(signedPdf);
			a.download = `signed_${file.name}`;
			a.textContent = `Télécharger ${file.name}`;
			signedDocs.appendChild(a);
		}

		status.textContent = "Signature terminée!";
		downloadSection.classList.remove('hidden');
	});

	// Fonction de signature PDF
	async function signPdf(file) {
		const { PDFDocument, rgb } = PDFLib;

		// Lire le fichier PDF
		const pdfBytes = await file.arrayBuffer();
		
		// Charger le PDF avec pdf-lib
		const pdfDoc = await PDFDocument.load(pdfBytes);
		
		// Accéder à la première page du PDF
		const pages = pdfDoc.getPages();
		const firstPage = pages[0];
		const { width } = firstPage.getSize();

		// Ajouter la signature en bas à droite
		firstPage.drawText('Guy Orel André', {
			x: width - 150, // Bas à droite
			y: 50,
			size: 20,
			color: rgb(0, 0, 0)
		});

		const signedPdfBytes = await pdfDoc.save();
		return new Blob([signedPdfBytes], { type: 'application/pdf' });
	}

	// Envoyer par email
	document.getElementById('email-btn').addEventListener('click', function () {
		const subject = encodeURIComponent("Documents Signés");
		const body = encodeURIComponent("Veuillez trouver en pièce jointe les documents signés.");
		window.location.href = `mailto:?subject=${subject}&body=${body}`;
	});

	// Imprimer les documents
	document.getElementById('print-btn').addEventListener('click', function () {
		const signedDocs = document.getElementById('signedDocs').getElementsByTagName('a');
		
		for (let i = 0; i < signedDocs.length; i++) {
			const pdfUrl = signedDocs[i].href;
			const iframe = document.createElement('iframe');
			iframe.style.display = 'none';
			iframe.src = pdfUrl;
			document.body.appendChild(iframe);
			iframe.contentWindow.focus();
			iframe.contentWindow.print();
		}
	});