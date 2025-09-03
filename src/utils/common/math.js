
/**
 * @Author: zhangsd
 * @Date: 2025-09-03 11:00:59
 * @LastEditTime: 2025-09-03 11:00:59
 * @LastEditors: zhangsd
 * @Description: 数学运算+金额
 * @FilePath: D:\YangyiWork\YYFRAMEWORK\view\src\utils\commonFunc\math.js
 */

let math = {
    // 加法运算
    numAdd(num1, num2) {
        let result = null
        if (!num1 && !num2) {
            result = 0
        } else {
            var baseNum, baseNum1, baseNum2;  
            try {  
                baseNum1 = num1.toString().split(".")[1].length;  
            } catch (e) {  
                baseNum1 = 0;  
            }  
            try {  
                baseNum2 = num2.toString().split(".")[1].length;  
            } catch (e) {  
                baseNum2 = 0;  
            }  
            baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));  
            result = (num1 * baseNum + num2 * baseNum) / baseNum;  
        }
        
        
        return result
    },
    // 减法运算
    numSub(num1, num2) {
        let result = null
        if (!num1 && !num2) {
            result = 0
        } else {
            var baseNum, baseNum1, baseNum2;  
            try {  
                baseNum1 = num1.toString().split(".")[1].length;  
            } catch (e) {  
                baseNum1 = 0;  
            }  
            try {  
                baseNum2 = num2.toString().split(".")[1].length;  
            } catch (e) {  
                baseNum2 = 0;  
            }  
            baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
            result = (num1 * baseNum - num2 * baseNum) / baseNum; 
        }
        
        
        return result
    },
    // 乘法运算
    numMulti(num1, num2, digit) {
        if(num1==null||num1==undefined){
            return
        }
        if(num2==null||num2==undefined){
           return
        }
        let result = null
        if (!num1 && !num2) {
            result = 0
        } else {
            var baseNum = 0;  
            try {  
                baseNum += num1.toString().split(".")[1].length;  
            } catch (e) {
            
            }  
            try {  
                baseNum += num2.toString().split(".")[1].length;  
            } catch (e) {  
            }  
            result =( Number(num1.toString().replace(".", "")) * Number(num2.toString().replace(".", ""))) / Math.pow(10, baseNum);
            // Math.round((result + Number.EPSILON) * Math.pow(10, digit)) / Math.pow(10, digit).toFixed(digit)
        }
        
        return result
                //  
                // 
    },
    // 除法运算
    numDiv(num1, num2) {  
        let result = null
        if (!num1 || !num2) {
            result = 0
        } else {
            var baseNum1 = 0, baseNum2 = 0;  
            var baseNum3, baseNum4;  
            try {  
                baseNum1 = num1.toString().split(".")[1].length;  
            } catch (e) {  
                baseNum1 = 0;  
            }  
            try {  
                baseNum2 = num2.toString().split(".")[1].length;  
            } catch (e) {  
                baseNum2 = 0;  
            }  
        
            baseNum3 = Number(num1.toString().replace(".", ""));  
            baseNum4 = Number(num2.toString().replace(".", ""));  
            result = (baseNum3 / baseNum4) * Math.pow(10, baseNum2 - baseNum1);  
        }
        
        return result
        
    }  
}
export default math