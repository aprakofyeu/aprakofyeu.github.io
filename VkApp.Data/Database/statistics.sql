USE [VkAppDb]
SELECT u.FirstName, u.LastName, c.Count FROM ( 
SELECT VkSenderId, COUNT(VkTargetUserId) as Count FROM Messages
GROUP BY VkSenderId) as c
INNER JOIN [User] u
ON c.VkSenderId=u.VkUserId