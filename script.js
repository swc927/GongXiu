const lampBackground = "GongXiu.png";
const deceasedBackground = "GongXiu-Deceased.png";

function cleanDeceasedName(name) {
  return name
    .replace(/^(故|已故|仙逝|往生)\s*/g, "")
    .replace(
      /[[\(（【{]{1}.*?(祖先|冤亲债主|众生|歷代|历代).*?[]\)）】}]{1}/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function generate() {
  const input = document.getElementById("input").value.trim();
  const lines = input
    .split("\n")
    .map((line) => line.replace(/\t+/g, " ").trim())
    .filter(Boolean);
  const output = document.getElementById("output");
  output.innerHTML = "";

  let page, deceasedPage;
  let regularCount = 0,
    deceasedCount = 0;
  const maxPerPage = 20;

  lines.forEach((line) => {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) return;

    const number = parts[0];
    const originalNameRaw = parts.slice(1).join(" ");
    const nameRaw = originalNameRaw.toLowerCase();
    const isDeceasedEntry = [
      "故",
      "众生",
      "歷代",
      "历代",
      "祖宗",
      "祖先",
      "冤亲债主",
      "sentient beings",
      "all sentient beings",
    ].some((keyword) => nameRaw.includes(keyword));

    const cleanedName = isDeceasedEntry
      ? cleanDeceasedName(originalNameRaw)
      : originalNameRaw;
    const name = smartCapitalize(cleanedName);

    if (isDeceasedEntry) {
      if (!deceasedPage || deceasedCount % maxPerPage === 0) {
        deceasedPage = createPage(deceasedBackground, "deceased");
      }
      createEntry(deceasedPage, number, name, true);
      deceasedCount++;
    } else {
      if (!page || regularCount % maxPerPage === 0) {
        page = createPage(lampBackground, "regular");
      }
      createEntry(page, number, name);
      regularCount++;
    }
  });

  document.querySelectorAll(".page").forEach((page) => {
    page.querySelectorAll(".entry").forEach((entry, i) => {
      if (i < 5) entry.classList.add("first-row");
    });
  });

  scalePages();
  output.scrollIntoView({ behavior: "smooth" });
}

function createPage(background, type) {
  const container = document.createElement("div");
  container.className = "container";
  const page = document.createElement("div");
  page.className = `page ${type} grid-page`;
  page.style.backgroundImage = `url('${background}')`;
  container.appendChild(page);
  document.getElementById("output").appendChild(container);
  return page;
}

function createEntry(page, number, name, isDeceasedOverride = false) {
  const entry = document.createElement("div");
  entry.className = "entry";
  const nameWrapper = document.createElement("div");
  nameWrapper.className = "name-wrapper";
  const cleanName = name
    .toLowerCase()
    .replace(/[\s\u00A0\u3000]+/g, " ")
    .trim();
  const isSpecialDeceased = [
    "众生",
    "歷代",
    "历代",
    "祖宗",
    "祖先",
    "冤亲债主",
    "sentient beings",
    "all sentient beings",
  ].some((k) => cleanName.includes(k));

  if (isDeceasedOverride && !isSpecialDeceased) {
    const deceasedLabel = document.createElement("div");
    deceasedLabel.className = "deceased-label";
    const vertical = document.createElement("div");
    vertical.className = "vertical-deceased";
    vertical.innerHTML = `
      <span class="rotated-bracket">(</span>
      <span class="vertical-char">已</span>
      <span class="vertical-char">故</span>
      <span class="rotated-bracket">)</span>`;
    deceasedLabel.appendChild(vertical);
    nameWrapper.appendChild(deceasedLabel);
  }

  const nameDiv = document.createElement("div");
  nameDiv.className = "name";
  nameDiv.innerHTML = formatName(name, isSpecialDeceased).replace(
    /\n/g,
    "<br>"
  );

  adjustFontSize(nameDiv, name, isDeceasedOverride);

  const length = name.replace(/\n/g, "").length;
  const isEnglish = !isChinese(name);

  if (isEnglish && length <= 10) {
    nameDiv.style.marginBottom = "40px";
  }

  if (name.replace(/\n/g, "").length > 6) {
    nameWrapper.classList.add("tight-gap");
  }

  nameWrapper.appendChild(nameDiv);
  const numberDiv = document.createElement("div");
  numberDiv.className = "number";
  numberDiv.textContent = number;
  nameWrapper.appendChild(numberDiv);
  entry.appendChild(nameWrapper);
  page.appendChild(entry);
}

function formatName(name, isSpecialDeceased) {
  const isChineseOnly = /^[\u4e00-\u9fff]+$/.test(name);
  if (isChineseOnly) {
    return name.split("").join("\n");
  }
  const result = [],
    buffer = [];
  let insideBracket = false,
    insideLatin = false,
    current = "";
  for (let char of name) {
    const isLatin = /[a-zA-Z]/.test(char);
    if (["(", "（"].includes(char)) {
      if (current)
        result.push(insideLatin ? current : current.split("").join("\n"));
      current = char;
      insideBracket = true;
      continue;
    }
    if ([")", "）"].includes(char)) {
      current += char;
      result.push(" " + current);
      current = "";
      insideBracket = false;
      continue;
    }
    if (insideBracket) {
      current += char;
      continue;
    }
    if (current && isLatin !== insideLatin) {
      result.push(insideLatin ? current : current.split("").join("\n"));
      current = "";
    }
    insideLatin = isLatin;
    current += char;
  }
  if (current)
    result.push(insideLatin ? current : current.split("").join("\n"));
  return result.join("\n");
}

function isChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

function adjustFontSize(nameDiv, name, isDeceased = false) {
  const length = name.replace(/\n/g, "").length;
  const isEnglish = !isChinese(name);

  if (length <= 3) nameDiv.style.fontSize = isDeceased ? "100px" : "130px";
  else if (length <= 5) nameDiv.style.fontSize = isDeceased ? "90px" : "100px";
  else if (length <= 6) nameDiv.style.fontSize = isDeceased ? "70px" : "90px";
  else nameDiv.style.fontSize = isEnglish ? "70px" : "60px";

  nameDiv.style.textAlign = "center";
  nameDiv.style.lineHeight = isEnglish
    ? length <= 3
      ? "0.9"
      : "0.65"
    : "1.05";
}

function smartCapitalize(name) {
  const corporateSuffixes = [
    "pte ltd",
    "private limited",
    "llp",
    "plc",
    "inc",
    "corp",
    "co",
    "co.",
    "ltd",
    "limited",
    "有限公司",
    "私人有限公司",
  ];

  const lowerCaseName = name.toLowerCase().trim();

  if (corporateSuffixes.some((suffix) => lowerCaseName.endsWith(suffix))) {
    return name;
  }

  return name
    .replace(/&amp;/g, " & ")
    .split(/\b/)
    .map((word) => {
      return /^[a-zA-Z]+$/.test(word)
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word;
    })
    .join("");
}

function scalePages() {
  document.querySelectorAll(".container").forEach((container) => {
    const page = container.querySelector(".page");
    const scaleX = (window.innerWidth * 0.95) / 3508;
    const scaleY = (window.innerHeight * 0.9) / 4961;
    const scale = Math.min(scaleX, scaleY);
    page.style.transform = `scale(${scale})`;
    page.style.transformOrigin = "top center";
  });
}

window.addEventListener("resize", scalePages);

document.getElementById("csvInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  if (document.getElementById("input").value.trim()) {
    const confirmReplace = confirm(
      "This will overwrite your current input. Continue?"
    );
    if (!confirmReplace) return;
  }
  const reader = new FileReader();
  reader.onload = function (event) {
    const lines = event.target.result
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    document.getElementById("input").value = lines
      .map((line) => {
        // ✅ PATCH D — CSV logic now handles commas in names:
        const [number, ...nameParts] = line.split(/,(.+)/);
        return `${number.trim()} ${nameParts.join("").trim()}`;
      })
      .join("\n");
  };
  reader.readAsText(file);
});

const { jsPDF } = window.jspdf;

function downloadPDF() {
  const output = document.getElementById("output");
  if (!output || output.innerHTML.trim() === "")
    return alert("No content to generate! Please click 'Generate' first.");

  const containers = document.querySelectorAll(".container");
  if (!containers.length)
    return alert("No pages to capture! Please generate first.");

  const loadingEl = document.getElementById("loading");
  if (loadingEl) loadingEl.style.display = "block";

  const originalTransforms = [];
  containers.forEach((container) => {
    const page = container.querySelector(".page");
    originalTransforms.push(page.style.transform);
    page.style.transform = "none";
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [3508, 4961],
  });

  function capturePage(index) {
    if (index >= containers.length) {
      containers.forEach((container, idx) => {
        const page = container.querySelector(".page");
        page.style.transform = originalTransforms[idx];
      });
      if (loadingEl) loadingEl.style.display = "none";
      pdf.save("Lamp_Offering_List_A3.pdf");
      return;
    }
    const container = containers[index];
    html2canvas(container, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/jpeg", 0.6);
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = Math.min(
          pdf.internal.pageSize.getWidth() / imgProps.width,
          pdf.internal.pageSize.getHeight() / imgProps.height
        );
        const imgWidth = imgProps.width * ratio;
        const imgHeight = imgProps.height * ratio;
        const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
        const y = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;
        if (index > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
        capturePage(index + 1);
      })
      .catch((error) => console.error("Error capturing page:", error));
  }

  capturePage(0);
}
