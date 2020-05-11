using System;
using System.Collections.Generic;
using System.Linq;
using NHibernate;
using VkApp.Data.Model;

namespace VkApp.Data.DataProviders
{
    public interface IFriendRequestsProvider
    {
        void MarkAsRequested(int friendRequestedUserId, int userId);
        IEnumerable<FriendRequest> GetFriendRequests(IEnumerable<int> userIds, DateTime requestsEdge);
    }

    class FriendRequestsProvider: IFriendRequestsProvider
    {
        private readonly ISession _session;

        public FriendRequestsProvider(ISession session)
        {
            _session = session;
        }

        public void MarkAsRequested(int friendRequestedUserId, int userId)
        {
            var invite = new FriendRequest
            {
                UserId = userId,
                RequestedUserId = friendRequestedUserId,
                Timestamp = DateTime.UtcNow
            };

            _session.SaveOrUpdate(invite);
        }

        public IEnumerable<FriendRequest> GetFriendRequests(IEnumerable<int> userIds, DateTime requestsEdge)
        {
            return _session.QueryOver<FriendRequest>()
                .Where(x=>x.Timestamp >= requestsEdge)
                .WhereRestrictionOn(x => x.UserId).IsIn(userIds.ToArray())
                .List();
        }
    }
}
