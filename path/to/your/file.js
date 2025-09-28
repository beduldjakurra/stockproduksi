// Update onclone function for html2canvas to improve table capture quality
function onclone() {
    // your existing code...
    html2canvas(document.querySelector('#capture'), {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: true,
        // other configurations...
    }).then(function(canvas) {
        // your existing code...
    });
}
