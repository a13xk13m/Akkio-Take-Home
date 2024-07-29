function updateRangeValueDisplay(rangeId, targetId) {
    let input = document.getElementById(rangeId);
    let target = document.getElementById(targetId);
    if (input === null) {
        console.log('invalid range ID');
    }
    if (target === null) {
        console.log('invalid target ID');
    }
    target.innerText = `${input.value}%`;

}

// Not entirely necessary because we are using a slider, but if we expanded to inputs 
// would be nice to have.
function validateInputs(saturation, lightness) {
    if (saturation === null || lightness === null) {
        console.log('input values null', saturation, lightness);
        return false;
    }
    if (saturation < 0 || lightness < 0) {
        console.log('input values less than 0', saturation, lightness);
        return false;
    }
    if (saturation > 100 || lightness > 100) {
        console.log('input values greater than 100', saturation, lightness);
        return false
    }
    return true;
}

// Generate our list of colors.
async function generateSwatch() {
    const saturation = document.getElementById('saturation').value;
    const lightness = document.getElementById('lightness').value;
    // Tell user search is happening.
    const grid = document.getElementById('colorGrid');
    grid.style.justifyContent = 'center';
    grid.textContent = 'Fetching colors';
    if (!validateInputs(saturation, lightness)) {
        console.log('invalid input values');
        return void 0;
    }
    
    const colors = await fetchColors(saturation, lightness);
    // Clear child nodes.
    grid.style.justifyContent = 'left';
    grid.textContent = '';
    for (let color of colors) {
        await drawColor(color);
    }
}

// Fetch colors.
async function fetchColors(saturation, lightness) {
    let colors = [];
    for(let hue = 0; hue < 360; hue += 1) {
        let idURL = `https://www.thecolorapi.com/id?hsl=${hue},${saturation}%,${lightness}%`;
        colors.push(fetch(idURL));
    }
    
    try {
        colors = await Promise.all(colors);
        colors = colors.map((color) => color.json());
        // This is the downside of using fetch, .json() returns another promise 
        colors = await Promise.all(colors);
        // Filter duplicates.
        colorCache = {};
        colors = colors.filter((color) => {
            let name = color.name.value;
            // Check cache
            if (name in colorCache) {
                return false;
            // Cache name if it isn't already stored
            } else {
                colorCache[name] = '';
            }
            return true;
        })
        return colors;
    } catch (error) {
        console.log(error, 'error fetching colors');
        return [];
    }
}

// Draw color
async function drawColor(colorData) {
    const name = colorData.name.value;
    const rgbData = colorData.rgb;
    const grid = document.getElementById('colorGrid');
    let colorDiv = document.createElement('div');
    colorDiv.className = 'colorContainer';
    let title = document.createElement('a');
    title.innerHTML = name;
    let rgb = document.createElement('a');
    rgb.innerText = `Red: ${rgbData.r} Green: ${rgbData.g} Blue ${rgbData.b}`;
    let color = document.createElement('div');
    color.className = 'colorBlock';
    color.style.backgroundColor = rgbData.value;
    colorDiv.appendChild(title);
    colorDiv.appendChild(document.createElement('br'));
    colorDiv.appendChild(rgb);
    colorDiv.appendChild(color);

    grid.appendChild(colorDiv);
}