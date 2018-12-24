USE [VkAppDb]
GO

/****** Object:  Table [dbo].[Application]    Script Date: 24.12.2018 12:40:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Application](
	[VkAppId] [int] NOT NULL,
	[Name] [nchar](255) NOT NULL,
	[MessagesCount] [int] NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Application] ADD  DEFAULT ((0)) FOR [MessagesCount]
GO

CREATE TABLE [dbo].[User](
	[VkUserId] [int] NOT NULL,
	[FirstName] [nvarchar](255) NOT NULL,
	[LastName] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED 
(
	[VkUserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[TargetGroup](
	[VkGroupId] [int] NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_TargetGroup] PRIMARY KEY CLUSTERED 
(
	[VkGroupId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[Messages](
	[VkSenderId] [int] NOT NULL,
	[VkTargetUserId] [int] NOT NULL,
	[VkTargetGroupId] [int] NOT NULL,
	[SentDate] [datetime] NOT NULL,
 CONSTRAINT [PK_Messages_1] PRIMARY KEY CLUSTERED 
(
	[VkTargetUserId] ASC,
	[VkTargetGroupId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO