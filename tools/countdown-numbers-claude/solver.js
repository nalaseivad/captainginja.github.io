export const VALID = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];

export function collectAdditive(tree) {
    if (tree.type === 'op' && tree.op === '+') {
        const l = collectAdditive(tree.left);
        const r = collectAdditive(tree.right);
        return { pos: [...l.pos, ...r.pos], neg: [...l.neg, ...r.neg] };
    }
    if (tree.type === 'op' && tree.op === '-') {
        const l = collectAdditive(tree.left);
        const r = collectAdditive(tree.right);
        return { pos: [...l.pos, ...r.neg], neg: [...l.neg, ...r.pos] };
    }
    return { pos: [tree], neg: [] };
}

export function collectMultiplicative(tree) {
    if (tree.type === 'op' && tree.op === '*') {
        const l = collectMultiplicative(tree.left);
        const r = collectMultiplicative(tree.right);
        return { num: [...l.num, ...r.num], den: [...l.den, ...r.den] };
    }
    if (tree.type === 'op' && tree.op === '/') {
        const l = collectMultiplicative(tree.left);
        const r = collectMultiplicative(tree.right);
        return { num: [...l.num, ...r.den], den: [...l.den, ...r.num] };
    }
    return { num: [tree], den: [] };
}

export function canonical(tree) {
    if (tree.type === 'num') return String(tree.val);
    const op = tree.op;

    if (op === '+' || op === '-') {
        const { pos, neg } = collectAdditive(tree);
        const wrap = t => {
            const s = canonical(t);
            return t.type === 'op' ? '(' + s + ')' : s;
        };
        const posStrs = pos.map(wrap).sort();
        const negStrs = neg.map(wrap).sort();
        if (neg.length === 0) return posStrs.join(' + ');
        if (pos.length === 1) {
            let result = posStrs[0];
            for (const s of negStrs) result += ' - ' + s;
            return result;
        }
        let result = '(' + posStrs.join(' + ') + ')';
        for (const s of negStrs) result += ' - ' + s;
        return result;
    }

    const { num, den } = collectMultiplicative(tree);
    const wrap = t => {
        const s = canonical(t);
        return t.type === 'op' ? '(' + s + ')' : s;
    };
    const numStrs = num.map(wrap).sort();
    const denStrs = den.map(wrap).sort();
    if (den.length === 0) return numStrs.join(' * ');
    if (num.length === 1) {
        let result = numStrs[0];
        for (const s of denStrs) result += ' / ' + s;
        return result;
    }
    let result = '(' + numStrs.join(' * ') + ')';
    for (const s of denStrs) result += ' / ' + s;
    return result;
}

export function solve(numbers, target) {
    const solutions = new Set();
    const initial = numbers.map(n => ({ val: n, tree: { type: 'num', val: n } }));

    function recurse(pool) {
        for (const e of pool) {
            if (e.val === target) {
                solutions.add(canonical(e.tree));
            }
        }
        if (pool.length < 2) return;

        for (let i = 0; i < pool.length; i++) {
            for (let j = i + 1; j < pool.length; j++) {
                const rest = [];
                for (let k = 0; k < pool.length; k++) {
                    if (k !== i && k !== j) rest.push(pool[k]);
                }
                const a = pool[i], b = pool[j];

                tryOp(a, b, '+', rest);
                if (a.val !== 1 && b.val !== 1)
                    tryOp(a, b, '*', rest);
                if (a.val > b.val)
                    tryOp(a, b, '-', rest);
                if (b.val > a.val)
                    tryOp(b, a, '-', rest);
                if (b.val > 1 && a.val % b.val === 0)
                    tryOp(a, b, '/', rest);
                if (a.val > 1 && b.val % a.val === 0)
                    tryOp(b, a, '/', rest);
            }
        }
    }

    function tryOp(a, b, op, rest) {
        let val;
        if (op === '+') val = a.val + b.val;
        else if (op === '-') val = a.val - b.val;
        else if (op === '*') val = a.val * b.val;
        else val = a.val / b.val;
        if (val <= 0) return;

        rest.push({ val, tree: { type: 'op', op, left: a.tree, right: b.tree } });
        recurse(rest);
        rest.pop();
    }

    recurse(initial);
    return [...solutions];
}

export function displayStr(canon) {
    return canon.replace(/ - /g, ' \u2212 ');
}

export function countNums(expr) {
    return (expr.match(/\d+/g) || []).length;
}

export function sortSolutions(results) {
    return results.slice().sort((a, b) => {
        const na = countNums(a), nb = countNums(b);
        if (na !== nb) return na - nb;
        if (a.length !== b.length) return a.length - b.length;
        return a < b ? -1 : a > b ? 1 : 0;
    });
}
