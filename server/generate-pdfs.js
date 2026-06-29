const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const aptitudeQuestions = require("./data/aptitude-questions.json");
const codingQuestions = require("./data/coding-questions.json");

const OUTPUT_DIR = path.join(__dirname, "..", "answer-keys");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const COLORS = {
  title: "#1e3a5f",
  heading: "#1e40af",
  subheading: "#374151",
  text: "#1f2937",
  answer: "#047857",
  answerBg: "#ecfdf5",
  option: "#374151",
  correct: "#047857",
  divider: "#d1d5db",
  section: "#1e40af",
  sectionBg: "#eff6ff",
  codeBg: "#f3f4f6",
  label: "#6b7280",
};

function drawHeader(doc, title, subtitle) {
  doc.rect(0, 0, doc.page.width, 100).fill(COLORS.title);
  doc.fillColor("#ffffff").fontSize(26).font("Helvetica-Bold")
    .text(title, 50, 30, { width: doc.page.width - 100 });
  doc.fontSize(12).font("Helvetica")
    .text(subtitle, 50, 65, { width: doc.page.width - 100 });
  doc.fillColor(COLORS.text);
  doc.y = 120;
}

function drawSectionBanner(doc, text) {
  checkPageBreak(doc, 50);
  const y = doc.y;
  doc.rect(50, y, doc.page.width - 100, 30).fill(COLORS.sectionBg);
  doc.rect(50, y, 4, 30).fill(COLORS.section);
  doc.fillColor(COLORS.section).fontSize(13).font("Helvetica-Bold")
    .text(text, 64, y + 8, { width: doc.page.width - 130 });
  doc.fillColor(COLORS.text);
  doc.y = y + 45;
}

function checkPageBreak(doc, needed) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
    doc.y = 50;
  }
}

function drawDivider(doc) {
  const y = doc.y;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y)
    .strokeColor(COLORS.divider).lineWidth(0.5).stroke();
  doc.y = y + 10;
}

// ─────────────────────────────────────────────
// PDF 1: Aptitude Questions & Answers
// ─────────────────────────────────────────────
function generateAptitudePDF() {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const filePath = path.join(OUTPUT_DIR, "Aptitude_Questions_and_Answers.pdf");
  doc.pipe(fs.createWriteStream(filePath));

  drawHeader(doc, "Aptitude Questions & Answers", "40 MCQ Questions  |  Interview Assessment  |  Answer Key");

  const sections = [
    { label: "Section A: Quantitative Aptitude (Q1 - Q12)", start: 0, end: 12 },
    { label: "Section B: Logical Reasoning (Q13 - Q24)", start: 12, end: 24 },
    { label: "Section C: Verbal Ability (Q25 - Q34)", start: 24, end: 34 },
    { label: "Section D: Data Interpretation (Q35 - Q40)", start: 34, end: 40 },
  ];

  const letters = ["A", "B", "C", "D"];

  sections.forEach((section) => {
    drawSectionBanner(doc, section.label);

    for (let i = section.start; i < section.end; i++) {
      const q = aptitudeQuestions[i];
      checkPageBreak(doc, 120);

      // Question
      doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.subheading)
        .text(`Q${q.id}. ${q.question}`, 55, doc.y, {
          width: doc.page.width - 110,
        });
      doc.moveDown(0.4);

      // Options
      q.options.forEach((opt, idx) => {
        const isCorrect = idx === q.answer;
        checkPageBreak(doc, 20);

        if (isCorrect) {
          const y = doc.y;
          doc.rect(70, y - 2, doc.page.width - 140, 18).fill(COLORS.answerBg);
          doc.fillColor(COLORS.correct).fontSize(10).font("Helvetica-Bold")
            .text(`  ${letters[idx]}. ${opt}  ✓`, 75, y, {
              width: doc.page.width - 150,
            });
        } else {
          doc.fillColor(COLORS.option).fontSize(10).font("Helvetica")
            .text(`  ${letters[idx]}. ${opt}`, 75, doc.y, {
              width: doc.page.width - 150,
            });
        }
        doc.moveDown(0.15);
      });

      // Answer line
      doc.moveDown(0.2);
      doc.fillColor(COLORS.answer).fontSize(9).font("Helvetica-Bold")
        .text(`Answer: ${letters[q.answer]}. ${q.options[q.answer]}`, 75, doc.y, {
          width: doc.page.width - 150,
        });
      doc.fillColor(COLORS.text);
      doc.moveDown(0.6);
      drawDivider(doc);
    }
  });

  // Summary page
  doc.addPage();
  drawHeader(doc, "Quick Answer Key", "All 40 Answers at a Glance");

  doc.y = 130;
  doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.subheading);

  for (let row = 0; row < 10; row++) {
    checkPageBreak(doc, 22);
    let line = "";
    for (let col = 0; col < 4; col++) {
      const idx = row * 4 + col;
      if (idx < 40) {
        const q = aptitudeQuestions[idx];
        const num = String(q.id).padStart(2, " ");
        line += `Q${num}: ${letters[q.answer]}     `;
      }
    }
    doc.fontSize(11).font("Helvetica").fillColor(COLORS.text)
      .text(line.trim(), 60, doc.y, { width: doc.page.width - 120 });
    doc.moveDown(0.5);
  }

  doc.end();
  console.log(`Created: ${filePath}`);
}

// ─────────────────────────────────────────────
// PDF 2: Coding Questions & Answers (Java + Python)
// ─────────────────────────────────────────────
function generateCodingPDF() {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const filePath = path.join(OUTPUT_DIR, "Coding_Questions_and_Answers.pdf");
  doc.pipe(fs.createWriteStream(filePath));

  drawHeader(doc, "Coding Questions & Answers", "4 Advanced Problems  |  Java & Python Solutions  |  Answer Key");

  const solutions = [
    {
      id: 1,
      title: "Trapping Rain Water",
      approach: "Use the two-pointer technique for O(n) time and O(1) space. Keep pointers at both ends with leftMax and rightMax. Always advance the side with the smaller current bar: the water trapped there is bounded by that side's running maximum (the opposite side is guaranteed to be taller). Add (max - height) at each step.",
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int n = parts.length;
        int[] height = new int[n];
        for (int i = 0; i < n; i++) height[i] = Integer.parseInt(parts[i]);

        int left = 0, right = n - 1, leftMax = 0, rightMax = 0;
        long water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        System.out.println(water);
    }
}`,
      python: `def solve():
    height = list(map(int, input().split()))
    n = len(height)

    left, right = 0, n - 1
    left_max = right_max = 0
    water = 0
    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1
    print(water)

solve()`,
    },
    {
      id: 2,
      title: "Edit Distance",
      approach: "Classic Levenshtein DP in O(m*n). Let dp[i][j] be the edit distance between the first i characters of word1 and the first j of word2. Base cases: dp[i][0] = i and dp[0][j] = j. If the characters match, dp[i][j] = dp[i-1][j-1]; otherwise it is 1 + min(replace = dp[i-1][j-1], delete = dp[i-1][j], insert = dp[i][j-1]).",
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String word1 = sc.hasNextLine() ? sc.nextLine() : "";
        String word2 = sc.hasNextLine() ? sc.nextLine() : "";
        int m = word1.length(), n = word2.length();

        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1],
                                   Math.min(dp[i - 1][j], dp[i][j - 1]));
                }
            }
        }
        System.out.println(dp[m][n]);
    }
}`,
      python: `import sys

def solve():
    data = sys.stdin.read().split("\\n")
    word1 = data[0] if len(data) > 0 else ""
    word2 = data[1] if len(data) > 1 else ""
    m, n = len(word1), len(word2)

    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])

    print(dp[m][n])

solve()`,
    },
    {
      id: 3,
      title: "Course Schedule",
      approach: "Model courses as a directed graph: 'a depends on b' becomes edge b -> a. All courses can be finished iff the graph is acyclic. Use Kahn's topological sort: push every node with in-degree 0, repeatedly pop a node and decrement its neighbours' in-degrees. If the number of processed nodes equals N, there is no cycle.",
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        int m = Integer.parseInt(sc.nextLine().trim());

        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] indegree = new int[n];

        for (int i = 0; i < m; i++) {
            StringTokenizer st = new StringTokenizer(sc.nextLine());
            int a = Integer.parseInt(st.nextToken());
            int b = Integer.parseInt(st.nextToken());
            adj.get(b).add(a);
            indegree[a]++;
        }

        Deque<Integer> queue = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indegree[i] == 0) queue.add(i);

        int processed = 0;
        while (!queue.isEmpty()) {
            int cur = queue.poll();
            processed++;
            for (int next : adj.get(cur)) {
                if (--indegree[next] == 0) queue.add(next);
            }
        }
        System.out.println(processed == n ? "Yes" : "No");
    }
}`,
      python: `import sys
from collections import deque

def solve():
    data = sys.stdin.read().split("\\n")
    idx = 0
    n = int(data[idx].strip()); idx += 1
    m = int(data[idx].strip()); idx += 1

    adj = [[] for _ in range(n)]
    indegree = [0] * n
    for _ in range(m):
        a, b = map(int, data[idx].split()); idx += 1
        adj[b].append(a)
        indegree[a] += 1

    queue = deque(i for i in range(n) if indegree[i] == 0)
    processed = 0
    while queue:
        cur = queue.popleft()
        processed += 1
        for nxt in adj[cur]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)

    print("Yes" if processed == n else "No")

solve()`,
    },
    {
      id: 4,
      title: "Largest Rectangle in Histogram",
      approach: "Use a monotonic increasing stack of bar indices in O(n). Iterate over the bars plus one sentinel of height 0 at the end. While the current bar is shorter than the bar at the stack top, pop it: the popped bar's height times the width (bounded by the current index and the new stack top) is a candidate area. Track the maximum.",
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int n = parts.length;
        int[] height = new int[n];
        for (int i = 0; i < n; i++) height[i] = Integer.parseInt(parts[i]);

        Deque<Integer> stack = new ArrayDeque<>();
        long maxArea = 0;
        for (int i = 0; i <= n; i++) {
            int cur = (i == n) ? 0 : height[i];
            while (!stack.isEmpty() && height[stack.peek()] >= cur) {
                int h = height[stack.pop()];
                int width = stack.isEmpty() ? i : i - stack.peek() - 1;
                maxArea = Math.max(maxArea, (long) h * width);
            }
            stack.push(i);
        }
        System.out.println(maxArea);
    }
}`,
      python: `def solve():
    height = list(map(int, input().split()))
    n = len(height)

    stack = []
    max_area = 0
    for i in range(n + 1):
        cur = 0 if i == n else height[i]
        while stack and height[stack[-1]] >= cur:
            h = height[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            if h * width > max_area:
                max_area = h * width
        stack.append(i)
    print(max_area)

solve()`,
    },
  ];

  solutions.forEach((sol, idx) => {
    if (idx > 0) doc.addPage();
    if (idx > 0) doc.y = 50;

    const q = codingQuestions[idx];

    // Problem title
    doc.fontSize(18).font("Helvetica-Bold").fillColor(COLORS.heading)
      .text(`Problem ${sol.id}: ${sol.title}`, 50, doc.y, {
        width: doc.page.width - 100,
      });
    doc.moveDown(0.5);

    // Description
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.text)
      .text(q.description, 50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.6);

    // Sample I/O
    checkPageBreak(doc, 80);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.label)
      .text("SAMPLE INPUT:", 55, doc.y);
    doc.moveDown(0.2);
    const siy = doc.y;
    doc.rect(55, siy - 2, doc.page.width - 110, 10 + q.sampleInput.split("\n").length * 13).fill(COLORS.codeBg);
    doc.fillColor(COLORS.text).fontSize(9).font("Courier")
      .text(q.sampleInput, 65, siy + 3, { width: doc.page.width - 130 });
    doc.moveDown(0.8);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.label)
      .text("SAMPLE OUTPUT:", 55, doc.y);
    doc.moveDown(0.2);
    const soy = doc.y;
    doc.rect(55, soy - 2, doc.page.width - 110, 10 + q.sampleOutput.split("\n").length * 13).fill(COLORS.codeBg);
    doc.fillColor(COLORS.text).fontSize(9).font("Courier")
      .text(q.sampleOutput, 65, soy + 3, { width: doc.page.width - 130 });
    doc.moveDown(0.8);

    // Constraints
    if (q.constraints) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.label)
        .text("CONSTRAINTS:", 55, doc.y);
      doc.moveDown(0.2);
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.text)
        .text(q.constraints, 65, doc.y, { width: doc.page.width - 130 });
      doc.moveDown(0.8);
    }

    drawDivider(doc);

    // Approach
    doc.moveDown(0.3);
    doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.answer)
      .text("Approach:", 50, doc.y);
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.text)
      .text(sol.approach, 55, doc.y, { width: doc.page.width - 110 });
    doc.moveDown(0.8);

    // Java Solution
    checkPageBreak(doc, 60);
    drawSectionBanner(doc, "Java Solution");
    doc.fontSize(8.5).font("Courier").fillColor(COLORS.text);
    const javaLines = sol.java.split("\n");
    javaLines.forEach((line) => {
      checkPageBreak(doc, 12);
      doc.text(line, 60, doc.y, { width: doc.page.width - 120 });
    });
    doc.moveDown(1);

    // Python Solution
    checkPageBreak(doc, 60);
    drawSectionBanner(doc, "Python Solution");
    doc.fontSize(8.5).font("Courier").fillColor(COLORS.text);
    const pyLines = sol.python.split("\n");
    pyLines.forEach((line) => {
      checkPageBreak(doc, 12);
      doc.text(line, 60, doc.y, { width: doc.page.width - 120 });
    });
  });

  doc.end();
  console.log(`Created: ${filePath}`);
}

// Generate both
generateAptitudePDF();
generateCodingPDF();
console.log("\nDone! PDFs saved in the 'answer-keys' folder.");
