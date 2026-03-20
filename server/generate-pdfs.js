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

  drawHeader(doc, "Coding Questions & Answers", "4 Problems  |  Java & Python Solutions  |  Answer Key");

  const solutions = [
    {
      id: 1,
      title: "Two Sum",
      approach: "Use a HashMap/dictionary to store each number's index as you iterate. For each element, check if (target - current) exists in the map. This gives O(n) time complexity.",
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i]);
        }
        int target = Integer.parseInt(sc.nextLine().trim());

        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                int j = map.get(complement);
                System.out.println(Math.min(i, j) + " " + Math.max(i, j));
                return;
            }
            map.put(nums[i], i);
        }
    }
}`,
      python: `def solve():
    nums = list(map(int, input().split()))
    target = int(input())

    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            j = seen[complement]
            print(min(i, j), max(i, j))
            return
        seen[num] = i

solve()`,
    },
    {
      id: 2,
      title: "Longest Substring Without Repeating Characters",
      approach: "Use the sliding window technique. Maintain a set of characters in the current window. Expand the right pointer; if a duplicate is found, shrink from the left until the duplicate is removed. Track the max window size.",
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();

        Set<Character> set = new HashSet<>();
        int left = 0, maxLen = 0;

        for (int right = 0; right < s.length(); right++) {
            while (set.contains(s.charAt(right))) {
                set.remove(s.charAt(left));
                left++;
            }
            set.add(s.charAt(right));
            maxLen = Math.max(maxLen, right - left + 1);
        }

        System.out.println(maxLen);
    }
}`,
      python: `def solve():
    s = input()

    char_set = set()
    left = 0
    max_len = 0

    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_len = max(max_len, right - left + 1)

    print(max_len)

solve()`,
    },
    {
      id: 3,
      title: "Group Anagrams",
      approach: "Sort each word alphabetically to create a canonical key. Use a LinkedHashMap (Java) or dict (Python) to group words by their sorted key. This preserves insertion order for the output.",
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        String[] words = sc.nextLine().trim().split("\\\\s+");

        Map<String, List<String>> map = new LinkedHashMap<>();
        for (String word : words) {
            char[] chars = word.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(word);
        }

        StringBuilder sb = new StringBuilder();
        for (List<String> group : map.values()) {
            sb.setLength(0);
            for (int i = 0; i < group.size(); i++) {
                if (i > 0) sb.append(" ");
                sb.append(group.get(i));
            }
            System.out.println(sb.toString());
        }
    }
}`,
      python: `def solve():
    n = int(input())
    words = input().split()

    groups = {}
    for word in words:
        key = tuple(sorted(word))
        if key not in groups:
            groups[key] = []
        groups[key].append(word)

    for group in groups.values():
        print(" ".join(group))

solve()`,
    },
    {
      id: 4,
      title: "Reverse a Linked List",
      approach: "Build a singly linked list from the input. Reverse it iteratively using three pointers: prev, current, and next. At each step, point current.next to prev, then advance all three pointers. Finally traverse and print.",
      java: `import java.util.*;

public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) {
            this.val = val;
            this.next = null;
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().trim().split("\\\\s+");

        // Build linked list
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        for (String p : parts) {
            tail.next = new ListNode(Integer.parseInt(p));
            tail = tail.next;
        }
        ListNode head = dummy.next;

        // Reverse
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        head = prev;

        // Print
        StringBuilder sb = new StringBuilder();
        ListNode node = head;
        while (node != null) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(node.val);
            node = node.next;
        }
        System.out.println(sb.toString());
    }
}`,
      python: `class ListNode:
    def __init__(self, val=0):
        self.val = val
        self.next = None

def solve():
    values = list(map(int, input().split()))

    # Build linked list
    dummy = ListNode(0)
    tail = dummy
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    head = dummy.next

    # Reverse
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    head = prev

    # Print
    result = []
    node = head
    while node:
        result.append(str(node.val))
        node = node.next
    print(" ".join(result))

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
