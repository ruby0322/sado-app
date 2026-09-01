
# SADo App

## 1. Repository Setup

Students must:

1. Fork the provided example repository.
2. Clone their fork locally.
3. Add the original repository as `upstream`.

```bash
git clone <your-fork-url>
cd <repository-name>
git remote add upstream <original-repo-url>
```

---

## 2. Repository Structure

The repository contains:

* `main` branch → stable reference branch (do not modify directly unless instructed)
* `dev` branch → integration branch for development
* Source files for modification and feature implementation

All development work must occur in feature branches created from `dev`.

---

## 3. In-Class Tasks (Basic Operations)

Students will practice the following Git operations on their fork:

### 3.1 Modify and Commit

* Edit an existing file or add a new file.
* Stage changes.
* Commit with a meaningful message.
* Push to GitHub.

```bash
git status
git add .
git commit -m "Describe your change clearly"
git push origin <branch-name>
```

---

### 3.2 Pull Updates

If updates are made to `dev`:

```bash
git checkout dev
git pull origin dev
```

Students must ensure their local branch stays up to date.

---

### 3.3 Branching and Merging Practice

1. Create a feature branch from `dev`.
2. Make changes.
3. Commit changes.
4. Merge back into `dev`.

```bash
git checkout dev
git checkout -b feature/<name>

# make changes
git add .
git commit -m "Implement feature"

git checkout dev
git merge feature/<name>
```

---

## 4. Homework: Feature Branch Workflow

### 4.1 Requirements

Students must:

1. Create a new branch following naming convention:

   ```
   feature/<short-feature-name>
   ```

2. Implement a small feature or enhancement.

3. Make **at least three meaningful commits**, for example:

   * Initial implementation
   * Improvement or refactor
   * Documentation or cleanup

4. Merge the completed feature branch into `dev`.

5. Push all branches to GitHub.

---

### 4.2 Commit Message Guidelines

Commit messages must:

* Be concise and descriptive
* Explain what changed, not just that something changed

Good example:

```
Add input validation to user form
```

Bad example:

```
update
```

---

## 5. Constraints

* Do not commit directly to `main`
* Do not delete existing core files
* Do not squash commits (commit history should remain visible)
* Do not force push

---

## 6. Deliverables

A GitHub repository containing:

* Proper branch structure
* Clear commit history
* A merged feature branch into `dev`
This project is a practice for Git workflow.