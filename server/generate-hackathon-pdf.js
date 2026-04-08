const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const problems = require("./data/coding-questions.json");

const OUTPUT_DIR = path.join(__dirname, "..", "answer-keys");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const COLORS = {
  title: "#1e3a5f",
  heading: "#1e40af",
  text: "#1f2937",
  answer: "#047857",
  label: "#6b7280",
  divider: "#d1d5db",
  sectionBg: "#eff6ff",
  section: "#1e40af",
  codeBg: "#f3f4f6",
};

function checkPageBreak(doc, needed) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
    doc.y = 50;
  }
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

function renderCodeBlock(doc, code) {
  doc.fontSize(8).font("Courier").fillColor(COLORS.text);
  code.split("\n").forEach((line) => {
    checkPageBreak(doc, 11);
    doc.text(line, 55, doc.y, { width: doc.page.width - 110 });
  });
  doc.moveDown(1.5);
}

const doc = new PDFDocument({ size: "A4", margin: 50 });
const filePath = path.join(OUTPUT_DIR, "Hackathon_Answer_Key.pdf");
doc.pipe(fs.createWriteStream(filePath));

// ─── Header ───
doc.rect(0, 0, doc.page.width, 100).fill(COLORS.title);
doc.fillColor("#ffffff").fontSize(26).font("Helvetica-Bold")
  .text("Hackathon Challenge - Answer Key", 50, 30, { width: doc.page.width - 100 });
doc.fontSize(12).font("Helvetica")
  .text("Library Management System  |  E-Commerce Order Management  |  Java & Python Solutions", 50, 65, { width: doc.page.width - 100 });
doc.fillColor(COLORS.text);
doc.y = 120;

// ═══════════════════════════════════════════════════════════════════════════════
// PROBLEM 1 — Library Management System
// ═══════════════════════════════════════════════════════════════════════════════
const problem1 = problems[0];

doc.fontSize(18).font("Helvetica-Bold").fillColor(COLORS.heading)
  .text(problem1.title, 50, doc.y, { width: doc.page.width - 100 });
doc.moveDown(0.5);

doc.fontSize(10).font("Helvetica").fillColor(COLORS.text)
  .text(problem1.description, 50, doc.y, { width: doc.page.width - 100 });
doc.moveDown(1);

// Approach
doc.addPage();
doc.y = 50;
doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.answer)
  .text("Solution Approach:", 50, doc.y);
doc.moveDown(0.4);
doc.fontSize(10).font("Helvetica").fillColor(COLORS.text)
  .text(
    "1. Create a Book class with fields: id, title, author, totalCopies, availableCopies.\n" +
    "2. Create a Member class with fields: id, name, and a Set of borrowed book IDs.\n" +
    "3. Create a Library class with two HashMaps: books (bookId -> Book) and members (memberId -> Member).\n" +
    "4. Implement each command as a method in the Library class.\n" +
    "5. For SEARCH, iterate all books and do case-insensitive contains check on title and author.\n" +
    "6. For BOOK_STATUS, find all members who have borrowed the book by checking each member's borrowed set, or maintain a reverse mapping.\n" +
    "7. Use LinkedHashMap or insertion-order tracking if you need deterministic ordering.\n\n" +
    "Time Complexity:\n" +
    "- ADD_BOOK, REGISTER_MEMBER, BORROW, RETURN: O(1) average with HashMap\n" +
    "- SEARCH: O(B) where B = number of books\n" +
    "- LIST_BORROWED: O(K) where K = books borrowed by that member\n" +
    "- BOOK_STATUS: O(M) where M = number of members (to find who borrowed it)",
    55, doc.y, { width: doc.page.width - 110 }
  );
doc.moveDown(1.5);

// Java Solution – Problem 1
drawSectionBanner(doc, "Java Solution — Library Management System");

const java1 = `import java.util.*;

public class Main {

    static class Book {
        String id, title, author;
        int totalCopies, availableCopies;
        Book(String id, String title, String author, int copies) {
            this.id = id;
            this.title = title;
            this.author = author;
            this.totalCopies = copies;
            this.availableCopies = copies;
        }
    }

    static class Member {
        String id, name;
        Set<String> borrowedBooks = new LinkedHashSet<>();
        Member(String id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    static class Library {
        Map<String, Book> books = new LinkedHashMap<>();
        Map<String, Member> members = new LinkedHashMap<>();

        void addBook(String id, String title, String author, int copies) {
            if (books.containsKey(id)) {
                Book b = books.get(id);
                b.totalCopies += copies;
                b.availableCopies += copies;
            } else {
                books.put(id, new Book(id, title, author, copies));
            }
        }

        void registerMember(String id, String name) {
            if (members.containsKey(id)) {
                System.out.println("MEMBER_ALREADY_EXISTS");
            } else {
                members.put(id, new Member(id, name));
            }
        }

        void borrow(String memberId, String bookId) {
            if (!members.containsKey(memberId)) {
                System.out.println("MEMBER_NOT_FOUND"); return;
            }
            if (!books.containsKey(bookId)) {
                System.out.println("BOOK_NOT_FOUND"); return;
            }
            Member m = members.get(memberId);
            Book b = books.get(bookId);
            if (m.borrowedBooks.contains(bookId)) {
                System.out.println("ALREADY_BORROWED"); return;
            }
            if (b.availableCopies <= 0) {
                System.out.println("NO_COPIES_AVAILABLE"); return;
            }
            b.availableCopies--;
            m.borrowedBooks.add(bookId);
            System.out.println("BORROWED_SUCCESSFULLY");
        }

        void returnBook(String memberId, String bookId) {
            if (!members.containsKey(memberId) || !books.containsKey(bookId)) {
                System.out.println("NOT_BORROWED"); return;
            }
            Member m = members.get(memberId);
            if (!m.borrowedBooks.contains(bookId)) {
                System.out.println("NOT_BORROWED"); return;
            }
            m.borrowedBooks.remove(bookId);
            books.get(bookId).availableCopies++;
            System.out.println("RETURNED_SUCCESSFULLY");
        }

        void search(String keyword) {
            String kw = keyword.toLowerCase();
            List<Book> results = new ArrayList<>();
            for (Book b : books.values()) {
                if (b.title.toLowerCase().contains(kw) || b.author.toLowerCase().contains(kw)) {
                    results.add(b);
                }
            }
            if (results.isEmpty()) {
                System.out.println("NO_RESULTS_FOUND");
            } else {
                for (Book b : results) {
                    System.out.println(b.id + " | " + b.title + " | " + b.author + " | Available: " + b.availableCopies);
                }
            }
        }

        void listBorrowed(String memberId) {
            if (!members.containsKey(memberId)) {
                System.out.println("MEMBER_NOT_FOUND"); return;
            }
            Member m = members.get(memberId);
            if (m.borrowedBooks.isEmpty()) {
                System.out.println("NO_BOOKS_BORROWED");
            } else {
                for (String bid : m.borrowedBooks) {
                    Book b = books.get(bid);
                    System.out.println(b.id + " | " + b.title);
                }
            }
        }

        void bookStatus(String bookId) {
            if (!books.containsKey(bookId)) {
                System.out.println("BOOK_NOT_FOUND"); return;
            }
            Book b = books.get(bookId);
            List<String> borrowers = new ArrayList<>();
            for (Member m : members.values()) {
                if (m.borrowedBooks.contains(bookId)) borrowers.add(m.name);
            }
            String bList = borrowers.isEmpty() ? "None" : String.join(", ", borrowers);
            System.out.println(b.title + " | Total: " + b.totalCopies + " | Available: " + b.availableCopies + " | Borrowed by: " + bList);
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        Library lib = new Library();

        for (int i = 0; i < n; i++) {
            String[] parts = sc.nextLine().trim().split("\\\\s+");
            switch (parts[0]) {
                case "ADD_BOOK":
                    lib.addBook(parts[1], parts[2], parts[3], Integer.parseInt(parts[4]));
                    break;
                case "REGISTER_MEMBER":
                    lib.registerMember(parts[1], parts[2]);
                    break;
                case "BORROW":
                    lib.borrow(parts[1], parts[2]);
                    break;
                case "RETURN":
                    lib.returnBook(parts[1], parts[2]);
                    break;
                case "SEARCH":
                    lib.search(parts[1]);
                    break;
                case "LIST_BORROWED":
                    lib.listBorrowed(parts[1]);
                    break;
                case "BOOK_STATUS":
                    lib.bookStatus(parts[1]);
                    break;
            }
        }
    }
}`;

renderCodeBlock(doc, java1);

// Python Solution – Problem 1
checkPageBreak(doc, 60);
drawSectionBanner(doc, "Python Solution — Library Management System");

const python1 = `class Book:
    def __init__(self, id, title, author, copies):
        self.id = id
        self.title = title
        self.author = author
        self.total_copies = copies
        self.available_copies = copies

class Member:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.borrowed_books = set()

class Library:
    def __init__(self):
        self.books = {}
        self.members = {}

    def add_book(self, id, title, author, copies):
        if id in self.books:
            self.books[id].total_copies += copies
            self.books[id].available_copies += copies
        else:
            self.books[id] = Book(id, title, author, copies)

    def register_member(self, id, name):
        if id in self.members:
            print("MEMBER_ALREADY_EXISTS")
        else:
            self.members[id] = Member(id, name)

    def borrow(self, member_id, book_id):
        if member_id not in self.members:
            print("MEMBER_NOT_FOUND"); return
        if book_id not in self.books:
            print("BOOK_NOT_FOUND"); return
        m = self.members[member_id]
        b = self.books[book_id]
        if book_id in m.borrowed_books:
            print("ALREADY_BORROWED"); return
        if b.available_copies <= 0:
            print("NO_COPIES_AVAILABLE"); return
        b.available_copies -= 1
        m.borrowed_books.add(book_id)
        print("BORROWED_SUCCESSFULLY")

    def return_book(self, member_id, book_id):
        if member_id not in self.members or book_id not in self.books:
            print("NOT_BORROWED"); return
        m = self.members[member_id]
        if book_id not in m.borrowed_books:
            print("NOT_BORROWED"); return
        m.borrowed_books.remove(book_id)
        self.books[book_id].available_copies += 1
        print("RETURNED_SUCCESSFULLY")

    def search(self, keyword):
        kw = keyword.lower()
        results = [b for b in self.books.values()
                   if kw in b.title.lower() or kw in b.author.lower()]
        if not results:
            print("NO_RESULTS_FOUND")
        else:
            for b in results:
                print(f"{b.id} | {b.title} | {b.author} | Available: {b.available_copies}")

    def list_borrowed(self, member_id):
        if member_id not in self.members:
            print("MEMBER_NOT_FOUND"); return
        m = self.members[member_id]
        if not m.borrowed_books:
            print("NO_BOOKS_BORROWED")
        else:
            for bid in m.borrowed_books:
                b = self.books[bid]
                print(f"{b.id} | {b.title}")

    def book_status(self, book_id):
        if book_id not in self.books:
            print("BOOK_NOT_FOUND"); return
        b = self.books[book_id]
        borrowers = [m.name for m in self.members.values() if book_id in m.borrowed_books]
        b_list = ", ".join(borrowers) if borrowers else "None"
        print(f"{b.title} | Total: {b.total_copies} | Available: {b.available_copies} | Borrowed by: {b_list}")

def main():
    n = int(input())
    lib = Library()
    for _ in range(n):
        parts = input().split()
        cmd = parts[0]
        if cmd == "ADD_BOOK":
            lib.add_book(parts[1], parts[2], parts[3], int(parts[4]))
        elif cmd == "REGISTER_MEMBER":
            lib.register_member(parts[1], parts[2])
        elif cmd == "BORROW":
            lib.borrow(parts[1], parts[2])
        elif cmd == "RETURN":
            lib.return_book(parts[1], parts[2])
        elif cmd == "SEARCH":
            lib.search(parts[1])
        elif cmd == "LIST_BORROWED":
            lib.list_borrowed(parts[1])
        elif cmd == "BOOK_STATUS":
            lib.book_status(parts[1])

main()`;

renderCodeBlock(doc, python1);

// ═══════════════════════════════════════════════════════════════════════════════
// PROBLEM 2 — E-Commerce Order Management System
// ═══════════════════════════════════════════════════════════════════════════════
const problem2 = problems[1];

doc.addPage();
doc.y = 50;

// Divider banner for Problem 2
doc.rect(0, 0, doc.page.width, 60).fill(COLORS.title);
doc.fillColor("#ffffff").fontSize(20).font("Helvetica-Bold")
  .text("Problem 2", 50, 18, { width: doc.page.width - 100 });
doc.fillColor(COLORS.text);
doc.y = 80;

doc.fontSize(18).font("Helvetica-Bold").fillColor(COLORS.heading)
  .text(problem2.title, 50, doc.y, { width: doc.page.width - 100 });
doc.moveDown(0.5);

doc.fontSize(10).font("Helvetica").fillColor(COLORS.text)
  .text(problem2.description, 50, doc.y, { width: doc.page.width - 100 });
doc.moveDown(1);

// Approach – Problem 2
doc.addPage();
doc.y = 50;
doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.answer)
  .text("Solution Approach:", 50, doc.y);
doc.moveDown(0.4);
doc.fontSize(10).font("Helvetica").fillColor(COLORS.text)
  .text(
    "1. Create classes: Product (id, name, price, stock), User (id, name, cart dict, orders list), Order (orderId, items, total).\n" +
    "2. ECommerceSystem manages products and users via HashMaps.\n" +
    "3. ADD_TO_CART checks stock availability including what's already in the cart.\n" +
    "4. PLACE_ORDER validates stock for all cart items before proceeding, then deducts stock and generates an auto-incrementing order ID (ORD001, ORD002, etc.).\n" +
    "5. VIEW_CART calculates subtotals per item and a total.\n" +
    "6. Use LinkedHashMap/dict to preserve insertion order.",
    55, doc.y, { width: doc.page.width - 110 }
  );
doc.moveDown(1.5);

// Java Solution – Problem 2
drawSectionBanner(doc, "Java Solution — E-Commerce Order Management System");

const java2 = `import java.util.*;

public class Main {

    static class Product {
        String id, name;
        int price, stock;
        Product(String id, String name, int price, int stock) {
            this.id = id; this.name = name; this.price = price; this.stock = stock;
        }
    }

    static class Order {
        String orderId;
        List<String[]> items; // [productId, name, qty, subtotal]
        int totalAmount;
        Order(String orderId, List<String[]> items, int totalAmount) {
            this.orderId = orderId; this.items = items; this.totalAmount = totalAmount;
        }
    }

    static class User {
        String id, name;
        Map<String, Integer> cart = new LinkedHashMap<>();
        List<Order> orders = new ArrayList<>();
        User(String id, String name) { this.id = id; this.name = name; }
    }

    static class ECommerceSystem {
        Map<String, Product> products = new LinkedHashMap<>();
        Map<String, User> users = new LinkedHashMap<>();
        int orderCounter = 0;

        void addProduct(String id, String name, int price, int stock) {
            if (products.containsKey(id)) {
                products.get(id).stock += stock;
            } else {
                products.put(id, new Product(id, name, price, stock));
            }
        }

        void createUser(String id, String name) {
            if (users.containsKey(id)) {
                System.out.println("USER_ALREADY_EXISTS");
            } else {
                users.put(id, new User(id, name));
            }
        }

        void addToCart(String userId, String productId, int qty) {
            if (!users.containsKey(userId)) { System.out.println("USER_NOT_FOUND"); return; }
            if (!products.containsKey(productId)) { System.out.println("PRODUCT_NOT_FOUND"); return; }
            Product p = products.get(productId);
            User u = users.get(userId);
            int currentInCart = u.cart.getOrDefault(productId, 0);
            if (currentInCart + qty > p.stock) { System.out.println("INSUFFICIENT_STOCK"); return; }
            u.cart.put(productId, currentInCart + qty);
            System.out.println("ADDED_TO_CART");
        }

        void viewCart(String userId) {
            if (!users.containsKey(userId)) { System.out.println("USER_NOT_FOUND"); return; }
            User u = users.get(userId);
            if (u.cart.isEmpty()) { System.out.println("CART_EMPTY"); return; }
            int total = 0;
            for (Map.Entry<String, Integer> e : u.cart.entrySet()) {
                Product p = products.get(e.getKey());
                int sub = p.price * e.getValue();
                total += sub;
                System.out.println(p.id + " | " + p.name + " | Qty: " + e.getValue() + " | Subtotal: " + sub);
            }
            System.out.println("Total: " + total);
        }

        void placeOrder(String userId) {
            if (!users.containsKey(userId)) { System.out.println("USER_NOT_FOUND"); return; }
            User u = users.get(userId);
            if (u.cart.isEmpty()) { System.out.println("CART_EMPTY"); return; }
            for (Map.Entry<String, Integer> e : u.cart.entrySet()) {
                Product p = products.get(e.getKey());
                if (p.stock < e.getValue()) {
                    System.out.println("INSUFFICIENT_STOCK " + e.getKey()); return;
                }
            }
            orderCounter++;
            String orderId = String.format("ORD%03d", orderCounter);
            int total = 0;
            List<String[]> items = new ArrayList<>();
            for (Map.Entry<String, Integer> e : u.cart.entrySet()) {
                Product p = products.get(e.getKey());
                p.stock -= e.getValue();
                int sub = p.price * e.getValue();
                total += sub;
                items.add(new String[]{p.id, p.name, String.valueOf(e.getValue()), String.valueOf(sub)});
            }
            u.orders.add(new Order(orderId, items, total));
            u.cart.clear();
            System.out.println("ORDER_PLACED " + orderId + " " + total);
        }

        void orderHistory(String userId) {
            if (!users.containsKey(userId)) { System.out.println("USER_NOT_FOUND"); return; }
            User u = users.get(userId);
            if (u.orders.isEmpty()) { System.out.println("NO_ORDERS"); return; }
            for (Order o : u.orders) {
                System.out.println(o.orderId + " | Items: " + o.items.size() + " | Total: " + o.totalAmount);
            }
        }

        void productInfo(String productId) {
            if (!products.containsKey(productId)) { System.out.println("PRODUCT_NOT_FOUND"); return; }
            Product p = products.get(productId);
            System.out.println(p.name + " | Price: " + p.price + " | Stock: " + p.stock);
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        ECommerceSystem sys = new ECommerceSystem();
        for (int i = 0; i < n; i++) {
            String[] parts = sc.nextLine().trim().split("\\\\s+");
            switch (parts[0]) {
                case "ADD_PRODUCT": sys.addProduct(parts[1], parts[2], Integer.parseInt(parts[3]), Integer.parseInt(parts[4])); break;
                case "CREATE_USER": sys.createUser(parts[1], parts[2]); break;
                case "ADD_TO_CART": sys.addToCart(parts[1], parts[2], Integer.parseInt(parts[3])); break;
                case "VIEW_CART": sys.viewCart(parts[1]); break;
                case "PLACE_ORDER": sys.placeOrder(parts[1]); break;
                case "ORDER_HISTORY": sys.orderHistory(parts[1]); break;
                case "PRODUCT_INFO": sys.productInfo(parts[1]); break;
            }
        }
    }
}`;

renderCodeBlock(doc, java2);

// Python Solution – Problem 2
checkPageBreak(doc, 60);
drawSectionBanner(doc, "Python Solution — E-Commerce Order Management System");

const python2 = `class Product:
    def __init__(self, id, name, price, stock):
        self.id = id
        self.name = name
        self.price = price
        self.stock = stock

class Order:
    def __init__(self, order_id, items, total):
        self.order_id = order_id
        self.items = items
        self.total = total

class User:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.cart = {}
        self.orders = []

class ECommerceSystem:
    def __init__(self):
        self.products = {}
        self.users = {}
        self.order_counter = 0

    def add_product(self, id, name, price, stock):
        if id in self.products:
            self.products[id].stock += stock
        else:
            self.products[id] = Product(id, name, price, stock)

    def create_user(self, id, name):
        if id in self.users:
            print("USER_ALREADY_EXISTS")
        else:
            self.users[id] = User(id, name)

    def add_to_cart(self, user_id, product_id, qty):
        if user_id not in self.users:
            print("USER_NOT_FOUND"); return
        if product_id not in self.products:
            print("PRODUCT_NOT_FOUND"); return
        p = self.products[product_id]
        u = self.users[user_id]
        current = u.cart.get(product_id, 0)
        if current + qty > p.stock:
            print("INSUFFICIENT_STOCK"); return
        u.cart[product_id] = current + qty
        print("ADDED_TO_CART")

    def view_cart(self, user_id):
        if user_id not in self.users:
            print("USER_NOT_FOUND"); return
        u = self.users[user_id]
        if not u.cart:
            print("CART_EMPTY"); return
        total = 0
        for pid, qty in u.cart.items():
            p = self.products[pid]
            sub = p.price * qty
            total += sub
            print(f"{p.id} | {p.name} | Qty: {qty} | Subtotal: {sub}")
        print(f"Total: {total}")

    def place_order(self, user_id):
        if user_id not in self.users:
            print("USER_NOT_FOUND"); return
        u = self.users[user_id]
        if not u.cart:
            print("CART_EMPTY"); return
        for pid, qty in u.cart.items():
            if self.products[pid].stock < qty:
                print(f"INSUFFICIENT_STOCK {pid}"); return
        self.order_counter += 1
        order_id = f"ORD{self.order_counter:03d}"
        total = 0
        items = []
        for pid, qty in u.cart.items():
            p = self.products[pid]
            p.stock -= qty
            sub = p.price * qty
            total += sub
            items.append((pid, p.name, qty, sub))
        u.orders.append(Order(order_id, items, total))
        u.cart.clear()
        print(f"ORDER_PLACED {order_id} {total}")

    def order_history(self, user_id):
        if user_id not in self.users:
            print("USER_NOT_FOUND"); return
        u = self.users[user_id]
        if not u.orders:
            print("NO_ORDERS"); return
        for o in u.orders:
            print(f"{o.order_id} | Items: {len(o.items)} | Total: {o.total}")

    def product_info(self, product_id):
        if product_id not in self.products:
            print("PRODUCT_NOT_FOUND"); return
        p = self.products[product_id]
        print(f"{p.name} | Price: {p.price} | Stock: {p.stock}")

def main():
    n = int(input())
    sys = ECommerceSystem()
    for _ in range(n):
        parts = input().split()
        cmd = parts[0]
        if cmd == "ADD_PRODUCT":
            sys.add_product(parts[1], parts[2], int(parts[3]), int(parts[4]))
        elif cmd == "CREATE_USER":
            sys.create_user(parts[1], parts[2])
        elif cmd == "ADD_TO_CART":
            sys.add_to_cart(parts[1], parts[2], int(parts[3]))
        elif cmd == "VIEW_CART":
            sys.view_cart(parts[1])
        elif cmd == "PLACE_ORDER":
            sys.place_order(parts[1])
        elif cmd == "ORDER_HISTORY":
            sys.order_history(parts[1])
        elif cmd == "PRODUCT_INFO":
            sys.product_info(parts[1])

main()`;

renderCodeBlock(doc, python2);

doc.end();
console.log(`Created: ${filePath}`);
