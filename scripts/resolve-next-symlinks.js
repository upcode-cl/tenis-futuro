/**
 * Next.js 16+ Turbopack crea symlinks/copias en .next/node_modules para
 * serverExternalPackages. Amplify no los empaqueta bien y faltan deps (bson).
 * Resuelve symlinks y copia dependencias transitivas al output de Next.
 */
const fs = require("fs");
const path = require("path");

const nextModules = path.join(__dirname, "..", ".next", "node_modules");
const rootModules = path.join(__dirname, "..", "node_modules");

function resolveDependencyPath(depName, parentPkgPath) {
  const directPath = path.join(rootModules, depName);
  try {
    const stat = fs.lstatSync(directPath);
    if (stat.isSymbolicLink()) {
      return fs.realpathSync(directPath);
    }
    if (stat.isDirectory()) {
      return directPath;
    }
  } catch {
    // not at root
  }

  if (parentPkgPath) {
    const parentNodeModules = path.dirname(parentPkgPath);
    const nestedPath = path.join(parentNodeModules, depName);
    try {
      const stat = fs.lstatSync(nestedPath);
      if (stat.isSymbolicLink()) {
        return fs.realpathSync(nestedPath);
      }
      if (stat.isDirectory()) {
        return nestedPath;
      }
    } catch {
      // not nested
    }
  }

  return null;
}

function copyPackageWithDeps(pkgPath, destPath, copiedSet, originalPkgPath) {
  const pkgName = path.basename(destPath);

  if (copiedSet.has(pkgName)) {
    return 0;
  }

  copiedSet.add(pkgName);
  console.log(`  Copying: ${pkgName}`);
  fs.cpSync(pkgPath, destPath, { recursive: true, dereference: true });
  let count = 1;

  const pkgJsonPath = path.join(destPath, "package.json");
  if (fs.existsSync(pkgJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    const deps = Object.keys(pkg.dependencies || {});

    for (const dep of deps) {
      const depDest = path.join(nextModules, dep);

      if (!fs.existsSync(depDest) && !copiedSet.has(dep)) {
        const depSrc = resolveDependencyPath(dep, originalPkgPath || pkgPath);
        if (depSrc) {
          count += copyPackageWithDeps(depSrc, depDest, copiedSet, depSrc);
        } else {
          console.log(`  Warning: Could not find dependency ${dep}`);
        }
      }
    }
  }

  return count;
}

function ensureMongoDeps() {
  if (!fs.existsSync(nextModules)) {
    return;
  }

  for (const name of fs.readdirSync(nextModules)) {
    if (!name.startsWith("mongodb-")) {
      continue;
    }

    const mongoPath = path.join(nextModules, name);
    const bsonDest = path.join(nextModules, "bson");

    if (fs.existsSync(bsonDest)) {
      continue;
    }

    const bsonSrc = resolveDependencyPath("bson", mongoPath);
    if (bsonSrc) {
      console.log(`Ensuring bson for ${name}`);
      copyPackageWithDeps(bsonSrc, bsonDest, new Set(), bsonSrc);
    }
  }
}

function main() {
  if (!fs.existsSync(nextModules)) {
    console.log("No .next/node_modules directory found, skipping.");
    return;
  }

  const entries = fs.readdirSync(nextModules);
  let resolved = 0;
  const copiedSet = new Set();

  for (const name of entries) {
    const linkPath = path.join(nextModules, name);
    const stat = fs.lstatSync(linkPath);

    if (stat.isSymbolicLink()) {
      const target = fs.realpathSync(linkPath);
      console.log(`Resolving: ${name} -> ${target}`);

      fs.rmSync(linkPath);
      copyPackageWithDeps(target, linkPath, copiedSet, target);
      resolved++;
    }
  }

  ensureMongoDeps();

  console.log(
    `Resolved ${resolved} symlinks, copied ${copiedSet.size} packages total.`,
  );
}

main();
