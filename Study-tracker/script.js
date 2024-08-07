document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    const { autoTable } = window.jspdf;

    let totalDays = 0;

    window.addEntry = () => {
        const entryDate = document.getElementById('entryDate').value;
        const exitDate = document.getElementById('exitDate').value;
        const entryAirport = document.getElementById('entryAirport').value;
        const exitAirport = document.getElementById('exitAirport').value;
        const imageUpload = document.getElementById('imageUpload').files[0];

        if (entryDate && exitDate) {
            const entryDateFormatted = new Date(entryDate).toLocaleDateString();
            const exitDateFormatted = new Date(exitDate).toLocaleDateString();

            let daysStudied = Math.ceil((new Date(exitDate) - new Date(entryDate)) / (1000 * 60 * 60 * 24));
            daysStudied = daysStudied > 0 ? daysStudied : 0;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entryDateFormatted}</td>
                <td>${exitDateFormatted}</td>
                <td>${entryAirport}</td>
                <td>${exitAirport}</td>
                <td>${daysStudied}</td>
                <td>${imageUpload ? '<img src="" style="max-width: 100px;" />' : ''}</td>
            `;

            document.getElementById('entriesBody').appendChild(row);

            // Handle image upload
            if (imageUpload) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = row.querySelector('img');
                    img.src = e.target.result;
                };
                reader.readAsDataURL(imageUpload);
            }

            // Update total days
            totalDays += daysStudied;
            document.getElementById('totalDays').textContent = totalDays;
        } else {
            alert('Please fill in both dates.');
        }
    };

    window.generatePDF = () => {
        const doc = new jsPDF();
        const table = document.getElementById('entriesTable');
        const rows = [];

        // Add header row
        rows.push([
            'Date of Entry',
            'Date of Exit',
            'Gate/Airport of Entry',
            'Gate/Airport of Exit',
            'Total Days Studied',
            'Picture'
        ]);

        // Collect table data
        document.querySelectorAll('#entriesBody tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            const picture = cells[5].querySelector('img') ? cells[5].querySelector('img').src : '';
            rows.push([
                cells[0].textContent,
                cells[1].textContent,
                cells[2].textContent,
                cells[3].textContent,
                cells[4].textContent,
                picture
            ]);
        });

        // Add table to PDF
        autoTable(doc, {
            head: [rows[0]],
            body: rows.slice(1),
            startY: 20,
            headStyles: { fillColor: [0, 123, 255] },
            bodyStyles: { valign: 'top' },
            margin: { top: 30 },
            didDrawPage: (data) => {
                // Add a footer with total days
                doc.text(`Total Days Studied: ${totalDays}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            },
            didParseCell: (data) => {
                // Handle images
                if (data.row.index >= 1 && data.column.index === 5) {
                    const imgSrc = data.cell.raw;
                    if (imgSrc) {
                        const img = new Image();
                        img.src = imgSrc;
                        img.onload = () => {
                            doc.addImage(img, 'JPEG', data.cell.x + 1, data.cell.y + 1, 40, 30); // Adjust size as needed
                        };
                    }
                }
            }
        });

        doc.save('study-tracker.pdf');
    };
});
