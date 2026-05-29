import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Upload, 
  Code, 
  Search, 
  ChevronLeft, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  Terminal,
  Trophy,
  Flame,
  Check,
  Cpu,
  Clock
} from 'lucide-react';

const mockQuestions = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Algorithms",
    acceptance: "57.5%",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    editorial: `### Approach: One-pass Hash Table
    
We can use a hash table to optimize the lookup time. As we iterate through the array, we check if the complement (\`target - nums[i]\`) exists in our hash table. If it does, we have found our solution and return the indices. Otherwise, we put the current element and its index into the hash table.

**Time Complexity**: O(n) - We traverse the list containing n elements only once.
**Space Complexity**: O(n) - The extra space required depends on the number of items stored in the hash table.`,
    solutions: {
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        throw new IllegalArgumentException("No two sum solution");
    }
}`,
      python3: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        prevMap = {} # val -> index
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff], i]
            prevMap[n] = i
        return []`,
      python: `class Solution(object):
    def twoSum(self, nums, target):
        prevMap = {} # val -> index
        for i, n in enumerate(nums):
            diff = target - n
            if diff in prevMap:
                return [prevMap[diff], i]
            prevMap[n] = i
        return []`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const prevMap = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (prevMap.has(diff)) {
            return [prevMap.get(diff), i];
        }
        prevMap.set(nums[i], i);
    }
    return [];
};`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    const prevMap = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (prevMap.has(diff)) {
            return [prevMap.get(diff), i];
        }
        prevMap.set(nums[i], i);
    }
    return [];
};`
    },
    templates: {
      java: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your Java code here
        
    }
}`,
      python3: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your Python 3 code here
        pass`,
      python: `class Solution(object):
    def twoSum(self, nums, target):
        # Write your Python code here
        pass`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your JavaScript code here
    
};`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Write your TypeScript code here
    
};`
    }
  },
  {
    id: 2,
    title: "Add Two Numbers",
    difficulty: "Medium",
    category: "Algorithms",
    acceptance: "48.5%",
    description: `You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.`,
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807."
      }
    ],
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros."
    ],
    editorial: `### Approach: Elementary Math
    
We traverse both linked lists representing the two non-negative integers. We simulate adding digits one by one starting from the head nodes, carrying over the value if the sum is 10 or greater.

**Time Complexity**: O(max(m, n)) - where m and n are lengths of l1 and l2 respectively.
**Space Complexity**: O(max(m, n)) - the length of the new list is at most max(m,n) + 1.`,
    solutions: {
      java: `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummyHead = new ListNode(0);
        ListNode p = l1, q = l2, curr = dummyHead;
        int carry = 0;
        while (p != null || q != null) {
            int x = (p != null) ? p.val : 0;
            int y = (q != null) ? q.val : 0;
            int sum = carry + x + y;
            carry = sum / 10;
            curr.next = new ListNode(sum % 10);
            curr = curr.next;
            if (p != null) p = p.next;
            if (q != null) q = q.next;
        }
        if (carry > 0) {
            curr.next = new ListNode(carry);
        }
        return dummyHead.next;
    }
}`,
      python3: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()
        curr = dummy
        carry = 0
        while l1 or l2 or carry:
            v1 = l1.val if l1 else 0
            v2 = l2.val if l2 else 0
            val = v1 + v2 + carry
            carry = val // 10
            val = val % 10
            curr.next = ListNode(val)
            curr = curr.next
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
        return dummy.next`,
      python: `class Solution(object):
    def addTwoNumbers(self, l1, l2):
        dummy = ListNode()
        curr = dummy
        carry = 0
        while l1 or l2 or carry:
            v1 = l1.val if l1 else 0
            v2 = l2.val if l2 else 0
            val = v1 + v2 + carry
            carry = val // 10
            val = val % 10
            curr.next = ListNode(val)
            curr = curr.next
            l1 = l1.next if l1 else None
            l2 = l2.next if l2 else None
        return dummy.next`,
      javascript: `var addTwoNumbers = function(l1, l2) {
    let dummy = new ListNode(0);
    let curr = dummy;
    let carry = 0;
    while (l1 !== null || l2 !== null || carry > 0) {
        let sum = carry;
        if (l1 !== null) {
            sum += l1.val;
            l1 = l1.next;
        }
        if (l2 !== null) {
            sum += l2.val;
            l2 = l2.next;
        }
        carry = Math.floor(sum / 10);
        curr.next = new ListNode(sum % 10);
        curr = curr.next;
    }
    return dummy.next;
};`,
      typescript: `function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    let dummy = new ListNode(0);
    let curr = dummy;
    let carry = 0;
    while (l1 !== null || l2 !== null || carry > 0) {
        let sum = carry;
        if (l1 !== null) {
            sum += l1.val;
            l1 = l1.next;
        }
        if (l2 !== null) {
            sum += l2.val;
            l2 = l2.next;
        }
        carry = Math.floor(sum / 10);
        curr.next = new ListNode(sum % 10);
        curr = curr.next;
    }
    return dummy.next;
};`
    },
    templates: {
      java: `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        // Write your Java code here
        
    }
}`,
      python3: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        # Write your Python 3 code here
        pass`,
      python: `class Solution(object):
    def addTwoNumbers(self, l1, l2):
        # Write your Python code here
        pass`,
      javascript: `/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {
    // Write your JavaScript code here
    
};`,
      typescript: `function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    // Write your TypeScript code here
    
};`
    }
  },
  {
    id: 3,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    category: "Algorithms",
    acceptance: "46.6%",
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be **O(log (m+n))**.`,
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2."
      },
      {
        input: "nums1 = [1,2], nums2 = [3,4]",
        output: "2.50000",
        explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5."
      }
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6"
    ],
    editorial: `### Approach: Binary Search on Partitions
    
To solve this in O(log(min(m, n))), we can apply binary search to find the correct partition point in the smaller array such that the left partition contains elements smaller than or equal to elements in the right partition.

**Time Complexity**: O(log(min(m, n)))
**Space Complexity**: O(1)`,
    solutions: {
      java: `class Solution {
    public double findMedianSortedArrays(int[] A, int[] B) {
        int m = A.length, n = B.length;
        if (m > n) {
            return findMedianSortedArrays(B, A);
        }
        int imin = 0, imax = m, halfLen = (m + n + 1) / 2;
        while (imin <= imax) {
            int i = (imin + imax) / 2;
            int j = halfLen - i;
            if (i < imax && B[j-1] > A[i]){
                imin = i + 1; // i is too small
            } else if (i > imin && A[i-1] > B[j]) {
                imax = i - 1; // i is too big
            } else { // i is perfect
                int maxLeft = 0;
                if (i == 0) { maxLeft = B[j-1]; }
                else if (j == 0) { maxLeft = A[i-1]; }
                else { maxLeft = Math.max(A[i-1], B[j-1]); }
                if ( (m + n) % 2 == 1 ) { return maxLeft; }

                int minRight = 0;
                if (i == m) { minRight = B[j]; }
                else if (j == n) { minRight = A[i]; }
                else { minRight = Math.min(A[i], B[j]); }

                return (maxLeft + minRight) / 2.0;
            }
        }
        return 0.0;
    }
}`,
      python3: `class Solution:
    def findMedianSortedArrays(self, A: List[int], B: List[int]) -> float:
        m, n = len(A), len(B)
        if m > n:
            return self.findMedianSortedArrays(B, A)
        imin, imax, halfLen = 0, m, (m + n + 1) // 2
        while imin <= imax:
            i = (imin + imax) // 2
            j = halfLen - i
            if i < imax and B[j-1] > A[i]:
                imin = i + 1
            elif i > imin and A[i-1] > B[j]:
                imax = i - 1
            else:
                maxLeft = 0
                if i == 0: maxLeft = B[j-1]
                elif j == 0: maxLeft = A[i-1]
                else: maxLeft = max(A[i-1], B[j-1])
                
                if (m + n) % 2 == 1:
                    return maxLeft
                    
                minRight = 0
                if i == m: minRight = B[j]
                elif j == n: minRight = A[i]
                else: minRight = min(A[i], B[j])
                
                return (maxLeft + minRight) / 2.0`,
      python: `class Solution(object):
    def findMedianSortedArrays(self, A, B):
        m, n = len(A), len(B)
        if m > n:
            return self.findMedianSortedArrays(B, A)
        imin, imax, halfLen = 0, m, (m + n + 1) // 2
        while imin <= imax:
            i = (imin + imax) // 2
            j = halfLen - i
            if i < imax and B[j-1] > A[i]:
                imin = i + 1
            elif i > imin and A[i-1] > B[j]:
                imax = i - 1
            else:
                maxLeft = 0
                if i == 0: maxLeft = B[j-1]
                elif j == 0: maxLeft = A[i-1]
                else: maxLeft = max(A[i-1], B[j-1])
                
                if (m + n) % 2 == 1:
                    return maxLeft
                    
                minRight = 0
                if i == m: minRight = B[j]
                elif j == n: minRight = A[i]
                else: minRight = min(A[i], B[j])
                
                return (maxLeft + minRight) / 2.0`,
      javascript: `var findMedianSortedArrays = function(A, B) {
    let m = A.length, n = B.length;
    if (m > n) return findMedianSortedArrays(B, A);
    let imin = 0, imax = m, halfLen = Math.floor((m + n + 1) / 2);
    while (imin <= imax) {
        let i = Math.floor((imin + imax) / 2);
        let j = halfLen - i;
        if (i < imax && B[j-1] > A[i]) {
            imin = i + 1;
        } else if (i > imin && A[i-1] > B[j]) {
            imax = i - 1;
        } else {
            let maxLeft = 0;
            if (i === 0) maxLeft = B[j-1];
            else if (j === 0) maxLeft = A[i-1];
            else maxLeft = Math.max(A[i-1], B[j-1]);
            
            if ((m + n) % 2 === 1) return maxLeft;
            
            let minRight = 0;
            if (i === m) minRight = B[j];
            else if (j === n) minRight = A[i];
            else minRight = Math.min(A[i], B[j]);
            
            return (maxLeft + minRight) / 2.0;
        }
    }
    return 0.0;
};`,
      typescript: `function findMedianSortedArrays(A: number[], B: number[]): number {
    let m = A.length, n = B.length;
    if (m > n) return findMedianSortedArrays(B, A);
    let imin = 0, imax = m, halfLen = Math.floor((m + n + 1) / 2);
    while (imin <= imax) {
        let i = Math.floor((imin + imax) / 2);
        let j = halfLen - i;
        if (i < imax && B[j-1] > A[i]) {
            let imin = i + 1;
        } else if (i > imin && A[i-1] > B[j]) {
            let imax = i - 1;
        } else {
            let maxLeft = 0;
            if (i === 0) maxLeft = B[j-1];
            else if (j === 0) maxLeft = A[i-1];
            else maxLeft = Math.max(A[i-1], B[j-1]);
            
            if ((m + n) % 2 === 1) return maxLeft;
            
            let minRight = 0;
            if (i === m) minRight = B[j];
            else if (j === n) minRight = A[i];
            else minRight = Math.min(A[i], B[j]);
            
            return (maxLeft + minRight) / 2.0;
        }
    }
    return 0.0;
};`
    },
    templates: {
      java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Write your Java code here
        
    }
}`,
      python3: `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        # Write your Python 3 code here
        pass`,
      python: `class Solution(object):
    def findMedianSortedArrays(self, nums1, nums2):
        # Write your Python code here
        pass`,
      javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function(nums1, nums2) {
    // Write your JavaScript code here
    
};`,
      typescript: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
    // Write your TypeScript code here
    
};`
    }
  },
  {
    id: 4,
    title: "Palindrome Number",
    difficulty: "Easy",
    category: "Algorithms",
    acceptance: "60.6%",
    description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.`,
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
      }
    ],
    constraints: [
      "-2^31 <= x <= 2^31 - 1"
    ],
    editorial: `### Approach: Revert half of the number
    
We can revert the second half of the number and compare it with the first half. If they are equal, it is a palindrome. For negative numbers or numbers ending with 0 (except 0 itself), they cannot be palindromes.

**Time Complexity**: O(log10(n)) - We divide the input by 10 in every iteration.
**Space Complexity**: O(1)`,
    solutions: {
      java: `class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) {
            return false;
        }
        int revertedNumber = 0;
        while (x > revertedNumber) {
            revertedNumber = revertedNumber * 10 + x % 10;
            x /= 10;
        }
        return x == revertedNumber || x == revertedNumber / 10;
    }
}`,
      python3: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0 or (x % 10 == 0 and x != 0):
            return False
        reverted = 0
        while x > reverted:
            reverted = reverted * 10 + x % 10
            x //= 10
        return x == reverted or x == reverted // 10`,
      python: `class Solution(object):
    def isPalindrome(self, x):
        if x < 0 or (x % 10 == 0 and x != 0):
            return False
        reverted = 0
        while x > reverted:
            reverted = reverted * 10 + x % 10
            x //= 10
        return x == reverted or x == reverted // 10`,
      javascript: `var isPalindrome = function(x) {
    if (x < 0 || (x % 10 === 0 && x !== 0)) {
        return false;
    }
    let revertedNumber = 0;
    while (x > revertedNumber) {
        revertedNumber = revertedNumber * 10 + x % 10;
        x = Math.floor(x / 10);
    }
    return x === revertedNumber || x === Math.floor(revertedNumber / 10);
};`,
      typescript: `function isPalindrome(x: number): boolean {
    if (x < 0 || (x % 10 === 0 && x !== 0)) {
        return false;
    }
    let revertedNumber = 0;
    while (x > revertedNumber) {
        revertedNumber = revertedNumber * 10 + x % 10;
        x = Math.floor(x / 10);
    }
    return x === revertedNumber || x === Math.floor(revertedNumber / 10);
};`
    },
    templates: {
      java: `class Solution {
    public boolean isPalindrome(int x) {
        // Write your Java code here
        
    }
}`,
      python3: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Write your Python 3 code here
        pass`,
      python: `class Solution(object):
    def isPalindrome(self, x):
        # Write your Python code here
        pass`,
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    // Write your JavaScript code here
    
};`,
      typescript: `function isPalindrome(x: number): boolean {
    // Write your TypeScript code here
    
};`
    }
  }
];

const PracticeQuestions = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [editorCode, setEditorCode] = useState('');
  
  // Workspace tabs
  const [leftTab, setLeftTab] = useState('description'); // 'description' | 'editorial' | 'solutions' | 'submissions'
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Submission lists
  const [localSubmissions, setLocalSubmissions] = useState({}); // questionId -> list of runs
  
  // Run states
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState(null);
  
  // Submit Overlay
  const [submitOverlayOpen, setSubmitOverlayOpen] = useState(false);
  const [submitStats, setSubmitStats] = useState(null);
  
  // Status check for solved count
  const [solvedStatus, setSolvedStatus] = useState({}); // questionId -> boolean

  // List of active questions from server or fallback mock
  const [questionsList, setQuestionsList] = useState(mockQuestions);

  // Fetch custom questions from database
  useEffect(() => {
    fetch('http://localhost:5000/api/practice-questions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setQuestionsList(data);
        }
      })
      .catch(err => console.error('Error fetching practice questions:', err));
  }, []);

  // Filter Categories
  const categories = ['All', 'Algorithms', 'Database', 'Shell', 'Concurrency', 'JavaScript'];

  // Initialize templates on active question choice or language selection
  useEffect(() => {
    if (activeQuestion) {
      const template = activeQuestion.templates[selectedLanguage] || '';
      setEditorCode(template);
      setRunLogs(null);
      setConsoleOpen(false);
    }
  }, [activeQuestion, selectedLanguage]);

  const handleSelectQuestion = (q) => {
    setActiveQuestion(q);
    setLeftTab('description');
  };

  const handleBackToList = () => {
    setActiveQuestion(null);
  };

  // Simulation: Run Code
  const handleRunCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleOpen(true);
    setRunLogs({ status: 'running', message: 'Running test cases...' });
    
    setTimeout(() => {
      setIsRunning(false);
      setRunLogs({
        status: 'success',
        stdout: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        expected: '[0,1]',
        message: 'Accepted (All test cases passed)'
      });
    }, 1500);
  };

  // Simulation: Submit Code
  const handleSubmitCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    
    setTimeout(() => {
      setIsRunning(false);
      const randomBeatsRuntime = (Math.random() * 15 + 80).toFixed(1);
      const randomBeatsMemory = (Math.random() * 20 + 75).toFixed(1);
      const runtimeMs = Math.floor(Math.random() * 40) + 50;
      const memoryMb = (Math.random() * 5 + 40).toFixed(1);

      const attempt = {
        date: new Date().toLocaleTimeString() + ' - ' + new Date().toLocaleDateString(),
        status: 'Accepted',
        runtime: `${runtimeMs} ms`,
        memory: `${memoryMb} MB`,
        language: selectedLanguage.toUpperCase()
      };

      // Add to submissions history
      setLocalSubmissions(prev => {
        const list = prev[activeQuestion.id] || [];
        return {
          ...prev,
          [activeQuestion.id]: [attempt, ...list]
        };
      });

      // Mark question as solved
      setSolvedStatus(prev => ({
        ...prev,
        [activeQuestion.id]: true
      }));

      setSubmitStats({
        runtime: attempt.runtime,
        runtimeBeats: randomBeatsRuntime,
        memory: attempt.memory,
        memoryBeats: randomBeatsMemory
      });

      setSubmitOverlayOpen(true);
    }, 1800);
  };

  // Filter logic
  const filteredQuestions = questionsList.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || q.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const solvedCount = Object.keys(solvedStatus).filter(id => solvedStatus[id]).length;

  return (
    <div style={{ minHeight: '85vh', fontFamily: '"Inter", sans-serif', color: 'var(--text-main)' }}>
      <AnimatePresence mode="wait">
        {!activeQuestion ? (
          // ----------------------------------------------------
          // SCREEN 1: QUESTIONS LIST VIEW
          // ----------------------------------------------------
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '30px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Code size={28} color="var(--primary)" /> Practice Playground
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginTop: '4px' }}>
                  Hone your coding skills on curated interview algorithm challenges.
                </p>
              </div>

              {/* Solved Tracker Widget */}
              <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', background: 'var(--glass-inner-darker)' }}>
                <Trophy size={20} color="#eab308" />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Progress</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>
                    {solvedCount} / {questionsList.length} Solved
                  </div>
                </div>
                <div style={{ width: '48px', height: '48px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Radial progress calculation */}
                  <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="24" cy="24" r="18" fill="transparent" stroke="var(--border)" strokeWidth="3" />
                    <circle cx="24" cy="24" r="18" fill="transparent" stroke="var(--primary)" strokeWidth="3.5"
                            strokeDasharray={2 * Math.PI * 18}
                            strokeDashoffset={2 * Math.PI * 18 * (1 - solvedCount / questionsList.length)}
                            strokeLinecap="round" />
                  </svg>
                  <span style={{ position: 'absolute', fontSize: '11px', fontWeight: 700 }}>
                    {Math.round((solvedCount / questionsList.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Filter category pills */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="glass"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                    background: activeCategory === cat ? 'var(--primary)' : 'var(--glass-bg)',
                    border: activeCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border)',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search inputs */}
            <div className="glass" style={{ padding: '16px 24px', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '12px', background: 'var(--glass-inner)', padding: '10px 16px', borderRadius: '10px' }}>
                <Search size={16} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Search coding challenges..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Questions Table Container */}
            <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ width: '80px', padding: '16px 24px' }}>Status</th>
                    <th style={{ padding: '16px 24px' }}>Title</th>
                    <th style={{ padding: '16px 24px' }}>Category</th>
                    <th style={{ padding: '16px 24px' }}>Acceptance</th>
                    <th style={{ padding: '16px 24px' }}>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        No questions found matching your criteria. Try another filter!
                      </td>
                    </tr>
                  ) : (
                    filteredQuestions.map(q => {
                      const isSolved = !!solvedStatus[q.id];
                      let diffColor = '#10b981';
                      if (q.difficulty === 'Medium') diffColor = '#f59e0b';
                      if (q.difficulty === 'Hard') diffColor = '#ef4444';

                      return (
                        <tr 
                          key={q.id} 
                          onClick={() => handleSelectQuestion(q)}
                          style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                        >
                          <td style={{ padding: '16px 24px' }}>
                            {isSolved ? (
                              <CheckCircle2 size={20} color="#10b981" fill="rgba(16,185,129,0.08)" />
                            ) : (
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border)' }} />
                            )}
                          </td>
                          <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                            {q.id}. {q.title}
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                            {q.category}
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                            {q.acceptance}
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ color: diffColor, fontWeight: 700, fontSize: '13px' }}>
                              {q.difficulty}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          // ----------------------------------------------------
          // SCREEN 2: SPLIT CODE EDITOR VIEW
          // ----------------------------------------------------
          <motion.div
            key="editor-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', height: '80vh', gap: '16px' }}
          >
            {/* Top Workspace Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <button 
                onClick={handleBackToList}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13.5px' }}
              >
                <ChevronLeft size={16} /> Problem List
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '13.5px', color: '#10b981', borderColor: 'rgba(16,185,129,0.2)' }}
                >
                  <Play size={14} fill="#10b981" /> Run Code
                </button>
                <button
                  onClick={handleSubmitCode}
                  disabled={isRunning}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', fontSize: '13.5px' }}
                >
                  <Upload size={14} /> Submit
                </button>
              </div>
            </div>

            {/* Split Screen Panel Wrapper */}
            <div style={{ display: 'flex', flex: 1, gap: '16px', minHeight: 0 }}>
              
              {/* LEFT SIDE PANEL: Problem details description */}
              <div className="glass" style={{ width: '45%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {/* Panel Tab selection header */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--glass-inner-darker)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', overflowX: 'auto' }}>
                  {[
                    { id: 'description', label: 'Description', icon: <BookOpen size={14} /> },
                    { id: 'editorial', label: 'Editorial', icon: <Layers size={14} /> },
                    { id: 'solutions', label: 'Solutions', icon: <HelpCircle size={14} /> },
                    { id: 'submissions', label: 'Submissions', icon: <Terminal size={14} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setLeftTab(tab.id)}
                      style={{
                        padding: '12px 20px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        background: leftTab === tab.id ? 'var(--glass-bg)' : 'transparent',
                        border: 'none',
                        borderBottom: leftTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                        color: leftTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content workspace scrollable */}
                <div style={{ padding: '24px', flex: 1, overflowY: 'auto', lineHeight: 1.6 }}>
                  {leftTab === 'description' && (
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>
                        {activeQuestion.id}. {activeQuestion.title}
                      </h2>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{
                          color: activeQuestion.difficulty === 'Easy' ? '#10b981' : activeQuestion.difficulty === 'Medium' ? '#f59e0b' : '#ef4444',
                          background: activeQuestion.difficulty === 'Easy' ? 'rgba(16,185,129,0.08)' : activeQuestion.difficulty === 'Medium' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}>
                          {activeQuestion.difficulty}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--glass-inner-darker)', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                          Acceptance: {activeQuestion.acceptance}
                        </span>
                      </div>

                      {/* Problem Description Content */}
                      <div style={{ fontSize: '14.5px', color: 'var(--text-main)', marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
                        {activeQuestion.description}
                      </div>

                      {/* Examples mapping */}
                      {activeQuestion.examples && activeQuestion.examples.map((ex, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Example {index + 1}:</h4>
                          <pre style={{
                            background: 'var(--glass-inner-darker)',
                            padding: '16px',
                            borderRadius: '12px',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border)',
                            whiteSpace: 'pre-wrap'
                          }}>
                            <strong>Input:</strong> {ex.input}<br />
                            <strong>Output:</strong> {ex.output}<br />
                            {ex.explanation && <><strong>Explanation:</strong> {ex.explanation}</>}
                          </pre>
                        </div>
                      ))}

                      {/* Constraints listing */}
                      {activeQuestion.constraints && (
                        <div style={{ marginTop: '24px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Constraints:</h4>
                          <ul style={{ paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {activeQuestion.constraints.map((c, i) => (
                              <li key={i}><code>{c}</code></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {leftTab === 'editorial' && (
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Editorial & Solutions Guide</h3>
                      <div style={{ fontSize: '14.5px', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                        {activeQuestion.editorial}
                      </div>
                    </div>
                  )}

                  {leftTab === 'solutions' && (
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Completed Code Reference</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '16px' }}>
                        Here is the target solution in {selectedLanguage.toUpperCase()} for your analysis:
                      </p>
                      <pre style={{
                        background: 'var(--glass-inner-darker)',
                        padding: '16px',
                        borderRadius: '12px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border)',
                        overflowX: 'auto',
                        whiteSpace: 'pre'
                      }}>
                        {activeQuestion.solutions[selectedLanguage] || '// Solution not available in this language'}
                      </pre>
                    </div>
                  )}

                  {leftTab === 'submissions' && (
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Attempt History</h3>
                      {!(localSubmissions[activeQuestion.id]) || localSubmissions[activeQuestion.id].length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '32px' }}>
                          No submissions recorded for this session yet. Hit "Submit" to test your code!
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {localSubmissions[activeQuestion.id].map((sub, i) => (
                            <div key={i} className="glass" style={{ padding: '16px', background: 'var(--glass-inner)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Check size={16} /> {sub.status}
                                </span>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub.date}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {sub.runtime}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Cpu size={12} /> {sub.memory}</span>
                                <span style={{ background: 'var(--glass-inner-darker)', padding: '2px 8px', borderRadius: '4px' }}>{sub.language}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE PANEL: Split view Code Editor & solution panels */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                {/* Editor Header */}
                <div className="glass" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'var(--glass-inner-darker)', borderBottom: '1px solid var(--border)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Code size={16} color="var(--primary)" />
                      <span style={{ fontSize: '13.5px', fontWeight: 700 }}>Workspace Editor</span>
                    </div>

                    {/* Language drop down selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Language:</span>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        style={{
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          color: 'var(--text-main)',
                          padding: '4px 10px',
                          fontSize: '13px',
                          fontWeight: 600,
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="java">Java</option>
                        <option value="python3">Python3</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                      </select>
                    </div>
                  </div>

                  {/* Code space (custom dark-themed code editor mock) */}
                  <div style={{ flex: 1, background: '#1e1e1e', color: '#d4d4d4', fontFamily: '"Fira Code", monospace', fontSize: '14px', position: 'relative', display: 'flex', minHeight: 0 }}>
                    {/* Line numbers column bar */}
                    <div style={{ width: '40px', background: '#1a1a1a', color: '#858585', padding: '16px 0', textSelect: 'none', borderRight: '1px solid #2d2d2d', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      {Array.from({ length: 25 }, (_, i) => i + 1).map(n => (
                        <div key={n} style={{ height: '21px', fontSize: '12px' }}>{n}</div>
                      ))}
                    </div>

                    {/* Interactive Text area workspace coding input */}
                    <textarea
                      value={editorCode}
                      onChange={(e) => setEditorCode(e.target.value)}
                      spellCheck="false"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#d4d4d4',
                        padding: '16px',
                        fontFamily: '"Fira Code", "Courier New", monospace',
                        fontSize: '14px',
                        lineHeight: '21px',
                        resize: 'none',
                        overflowY: 'auto'
                      }}
                    />
                  </div>

                  {/* Interactive Console display outputs */}
                  {consoleOpen && (
                    <div style={{ height: '180px', borderTop: '2px solid var(--border)', background: 'var(--glass-inner-darker)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--glass-inner)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
                          <Terminal size={14} /> Console Output
                        </div>
                        <button 
                          onClick={() => setConsoleOpen(false)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                          Minimize
                        </button>
                      </div>
                      
                      <div style={{ padding: '16px', overflowY: 'auto', flex: 1, fontFamily: 'monospace', fontSize: '13px' }}>
                        {runLogs && runLogs.status === 'running' && (
                          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', border: '2px solid var(--text-muted)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <span>{runLogs.message}</span>
                          </div>
                        )}
                        
                        {runLogs && runLogs.status === 'success' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ color: '#10b981', fontWeight: 700 }}>{runLogs.message}</span>
                            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '8px 12px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div><span style={{ color: 'var(--text-muted)' }}>Input:</span> {runLogs.stdout}</div>
                              <div><span style={{ color: 'var(--text-muted)' }}>Output:</span> <span style={{ color: '#10b981', fontWeight: 600 }}>{runLogs.output}</span></div>
                              <div><span style={{ color: 'var(--text-muted)' }}>Expected:</span> {runLogs.expected}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom simulation CSS animations */}
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBMIT OVERLAY RESULTS CARD */}
      <AnimatePresence>
        {submitOverlayOpen && submitStats && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass"
              style={{ width: '100%', maxWidth: '460px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--shadow)' }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle2 size={32} />
              </div>
              
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0' }}>
                Success! Accepted
              </h3>
              
              <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', margin: '0 0 28px 0', lineHeight: 1.5 }}>
                Your code passed all automated tests successfully. Keep up the great work!
              </p>

              {/* Stats beats display percentiles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginBottom: '32px' }}>
                <div style={{ background: 'var(--glass-inner-darker)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                    <Clock size={14} /> Runtime
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>{submitStats.runtime}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Beats {submitStats.runtimeBeats}% of runs</div>
                </div>
                <div style={{ background: 'var(--glass-inner-darker)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
                    <Cpu size={14} /> Memory
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>{submitStats.memory}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Beats {submitStats.memoryBeats}% of runs</div>
                </div>
              </div>

              <button
                onClick={() => { setSubmitOverlayOpen(false); setLeftTab('submissions'); }}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '15px' }}
              >
                Close & View Submissions
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticeQuestions;
